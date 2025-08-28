import { useEffect, useRef, useCallback, useState } from "react";

import { wsBackEndUrl, httpBackEndUrl } from '../data/url'
import debounce from '../utils/debounce';
import type { Element } from '../model/type'
import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export default function useWebSocket({
  elements,
  setElements,
  room,
  router,
  searchParams
}:{
  elements: Element[],
  setElements: React.Dispatch<React.SetStateAction<Element[]>>,
  room?: string,
  router:AppRouterInstance,
  searchParams:ReadonlyURLSearchParams
}) {
  const ws = useRef<WebSocket | null>(null);
  const isRemoteUpdateRef = useRef(false);
  const [roomId,setRoomId] = useState(room || '')
  const [num,setNum] = useState(1)

  useEffect(() => {
    if (searchParams.has('room')) return;
    fetch(httpBackEndUrl+'/room')
    .then((r) => r.json())
    .then(({ roomId }) => router.replace(`/?room=${roomId}`))
    .catch((err) => {}); 
  }, [router,searchParams]);

  useEffect(() => {
    ws.current = new WebSocket(`${wsBackEndUrl}?room=${roomId}`);
    ws.current.onopen = () => {
    }
    ws.current.onmessage = (event) => {
      isRemoteUpdateRef.current = true; // 标记为远程更新
      setElements(JSON.parse(event.data).elements)
      setNum(JSON.parse(event.data).num)
    }
    ws.current.onclose = () => {
      setRoomId('')
    }
    ws.current.onerror = (err) => {
      // console.log("WebSocket 错误:", err);
    };
    return () => {
      ws.current?.close();
    };
  }, [roomId,setElements,setRoomId]);

  // 发送消息方法
  const sendMessage = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    }
  }, []);
  useEffect(() => {
    if(!isRemoteUpdateRef.current) {
      debounce(() => sendMessage(JSON.stringify(elements)), 300)();  // 300ms内多次更新只发送最后一次
    }
    isRemoteUpdateRef.current = false;
  }, [elements, sendMessage]);
  return { 
    roomId,
    num
  };
}
