import { useEffect, useRef, useCallback, useState } from "react";

import debounce from '../utils/debounce';

export default function useWebSocket({url,elements,setElements,room}) {
  const ws = useRef<WebSocket | null>(null);
  const isRemoteUpdateRef = useRef(false);
  const [roomId,setRoomId] = useState(room || '')
  const [num,setNum] = useState(1)
  useEffect(() => {
    ws.current = new WebSocket(url+'/room='+roomId);
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
      console.log("WebSocket 错误:", err);
    };
    return () => {
      ws.current?.close();
    };
  }, [url,roomId,setElements,setRoomId]);

  // 发送消息方法
  const sendMessage = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    }
  }, []);
  useEffect(() => {
    if(!isRemoteUpdateRef.current) {
      debounce(sendMessage(JSON.stringify(elements)),300)  // 300ms内多次更新只发送最后一次
    }
    isRemoteUpdateRef.current = false;
  }, [elements, sendMessage]);
  return { 
    roomId,
    num
  };
}
