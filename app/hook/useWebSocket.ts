import { useEffect, useRef, useCallback, useState } from "react";

import { wsBackEndUrl, httpBackEndUrl, isProduction } from '../data/url'
import debounce from '../utils/debounce';
import type { Element } from '../model/type'
import type { ReadonlyURLSearchParams } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export default function useWebSocket({
  elements,
  setElements,
  room,
  router,
  searchParams,
  isRemoteUpdateRef
}:{
  elements: Element[],
  setElements: React.Dispatch<React.SetStateAction<Element[]>>,
  room?: string,
  router:AppRouterInstance,
  searchParams:ReadonlyURLSearchParams,
  isRemoteUpdateRef: React.RefObject<boolean|undefined>
}) {
  const ws = useRef<WebSocket | null>(null);
  const [roomId,setRoomId] = useState(room || '')
  const [num,setNum] = useState(1)
  const version = useRef<number>(Date.now());
  useEffect(() => {
    if (searchParams.has('room')) return;
    fetch(httpBackEndUrl+'/room')
    .then((r) => r.json())
    .then(({ roomId }) => router.replace(`/?room=${roomId}`))
    .catch(() => {}); 
  }, [router,searchParams]);

  useEffect(() => {
    ws.current = isProduction?new WebSocket(`${wsBackEndUrl}?room=${roomId}`):new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${wsBackEndUrl}?room=${roomId}`);
    ws.current.onopen = () => {
    }
    ws.current.onmessage = (event) => {
      console.log(Date.now());
      isRemoteUpdateRef.current = true; // 标记为远程更新
      if(JSON.parse(event.data).type == 'num') {
        setNum(JSON.parse(event.data).num)
        return;
      }
      if(JSON.parse(event.data).type == 'init' && JSON.parse(event.data).roomElements) {
        setElements(JSON.parse(event.data).roomElements)
        return;
      }
      if(version.current && JSON.parse(event.data).version.current && version.current >= JSON.parse(event.data).version.current) {
        return; 
      }
      if(JSON.parse(event.data).type == 'cloud'){
        setElements(JSON.parse(event.data).elements)
        setNum(JSON.parse(event.data).num)
      }
    }
    ws.current.onclose = () => {
      setRoomId('')
    }
    ws.current.onerror = () => {
    };
    return () => {
      ws.current?.close();
    };
  }, [roomId]);

  // 发送消息方法
  const sendMessage = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    }
  }, []);
  const debouncedSend = useRef(
    debounce((payload) => {
      sendMessage(JSON.stringify(payload))
    }, 120)
  ).current
  useEffect(() => {
    version.current = Date.now();
    if(!isRemoteUpdateRef.current && elements.length > 0) {
      debouncedSend({elements,version})
    }
    isRemoteUpdateRef.current = false;
  }, [elements]);
  useEffect(() => {
    return () => {
      debouncedSend.cancel();
    };
  }, []);
  return { 
    roomId,
    num
  };
}