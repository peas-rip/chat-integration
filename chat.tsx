// "use client"

// import type React from "react"
// import { Send, Upload, Paperclip } from "lucide-react";
// import { useEffect, useRef, useState, useCallback } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { cn } from "@/lib/utils"

// interface Message {
//   content: string
//   role: "user" | "agent" | "system"
//   timestamp: string
// }

// export default function Chat() {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [input, setInput] = useState("")
//   const [isConnected, setIsConnected] = useState(false)
//   const [showFileUpload, setShowFileUpload] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [reconnectAttempt, setReconnectAttempt] = useState(0)
//   const ws = useRef<WebSocket | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const maxReconnectAttempts = 5
//   const reconnectDelay = 3000 // 3 seconds

//   const scrollToBottom = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [])

//   useEffect(() => {
//     scrollToBottom()
//   }, [scrollToBottom])

//   const connectWebSocket = useCallback(() => {
//     if (ws.current) return; // Prevent multiple connections
  
//     try {
//       ws.current = new WebSocket("ws://localhost:8000/ws");
  
//       ws.current.onopen = () => {
//         console.log("Connected to WebSocket");
//         setIsConnected(true);
//         setReconnectAttempt(0); // Reset on successful connection
//       };
  
//       ws.current.onmessage = (event) => {
//         setMessages((prev) => [...prev, { content: event.data, role: "agent" }]);
//       };
  
//       ws.current.onclose = (event) => {
//         console.warn("WebSocket closed:", event.code, event.reason);
//         setIsConnected(false);
//         ws.current = null; // Clear reference
  
//         // Prevent infinite reconnects
//         if (event.code !== 1000 && reconnectAttempt < maxReconnectAttempts) {
//           setTimeout(() => {
//             setReconnectAttempt((prev) => prev + 1);
//             connectWebSocket();
//           }, reconnectDelay);
//         }
//       };
  
//       ws.current.onerror = (error) => {
//         console.error("WebSocket error:", error);
//       };
//     } catch (error) {
//       console.error("WebSocket connection error:", error);
//     }
//   }, [reconnectAttempt]);
  

//   useEffect(() => {
//     if (!ws.current) {
//       connectWebSocket();
//     }
  
//     return () => {
//       if (ws.current) {
//         ws.current.close();
//         ws.current = null;
//       }
//     };
//   }, []); // Empty dependency array ensures it runs only once
  
//   const sendMessage = useCallback((content: string) => {
//     if (!content.trim() || !ws.current) return

//     try {
//       ws.current.send(content)
//       setMessages((prev) => [
//         ...prev,
//         {
//           content,
//           role: "user",
//           timestamp: new Date().toLocaleTimeString(),
//         },
//       ])
//       setInput("")
//       setIsLoading(true)
//     } catch (error) {
//       console.error("Error sending message:", error)
//       setMessages((prev) => [
//         ...prev,
//         {
//           content: "Error sending message. Please try again.",
//           role: "system",
//           timestamp: new Date().toLocaleTimeString(),
//         },
//       ])
//     }
//   }, [])

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     sendMessage(input)
//   }

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file || !ws.current) return

//     try {
//       setMessages((prev) => [
//         ...prev,
//         {
//           content: `Uploading file: ${file.name}`,
//           role: "user",
//           timestamp: new Date().toLocaleTimeString(),
//         },
//       ])

//       setIsLoading(true)

//       // Send file choice indicator through WebSocket
//       ws.current.send("1")

//       setShowFileUpload(false)
//     } catch (error) {
//       console.error("File upload error:", error)
//       setMessages((prev) => [
//         ...prev,
//         {
//           content: "Error uploading file. Please try again.",
//           role: "system",
//           timestamp: new Date().toLocaleTimeString(),
//         },
//       ])
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
//       <CardHeader>
//         <CardTitle className="flex items-center justify-between">
//           Chat Assistant
//           <div className="flex items-center gap-2">
//             <span className={cn("inline-block h-2 w-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
//             <span className="text-sm text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
//           </div>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="flex-1 overflow-hidden">
//         <ScrollArea className="h-full pr-4">
//           <div className="space-y-4">
//             {messages.map((message, index) => (
//               <div
//                 key={index}
//                 className={cn(
//                   "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
//                   message.role === "user"
//                     ? "ml-auto bg-primary text-primary-foreground"
//                     : message.role === "system"
//                       ? "mx-auto bg-muted/50 text-muted-foreground"
//                       : "bg-muted",
//                 )}
//               >
//                 <div>{message.content}</div>
//                 <div className="text-xs opacity-50">{message.timestamp}</div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>
//         </ScrollArea>
//       </CardContent>
//       <CardFooter>
//         <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
//           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
//           {showFileUpload && (
//             <Button
//               type="button"
//               size="icon"
//               variant="outline"
//               onClick={() => fileInputRef.current?.click()}
//               className="flex-shrink-0 animate-bounce"
//             >
//               <Upload className="h-4 w-4" />
//               <span className="sr-only">Upload file</span>
//             </Button>
//           )}
//           <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." />
//           <Button type="submit" size="icon" disabled={!isConnected}>
//             <Send className="h-4 w-4" />
//             <span className="sr-only">Send message</span>
//           </Button>
//         </form>
//       </CardFooter>
//     </Card>
//   )
// }


"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  content: string
  role: "user" | "agent" | "system"
  timestamp: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [latestAgentResponse, setLatestAgentResponse] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const ws = useRef<WebSocket | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const maxReconnectAttempts = 5
  const reconnectDelay = 3000 // 3 seconds
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom, messages])

  const connectWebSocket = useCallback(() => {
    if (ws.current) return; // Prevent multiple connections

    try {
      ws.current = new WebSocket("ws://localhost:8000/ws");

      ws.current.onopen = () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);
        setReconnectAttempt(0); // Reset on successful connection
      };

      ws.current.onmessage = (event) => {
        const newMessage: Message = { 
          content: event.data, 
          role: "agent", 
          timestamp: new Date().toLocaleTimeString() 
        };

        setMessages((prev) => [...prev, newMessage]);

        // Prevent re-triggering if the agent's initial message is received
        if (
          event.data !== "Hi <USER>, welcome to agent 1. I can help you with creating project charter and flowcharts."
        ) {
          setLatestAgentResponse((prev) => (prev === event.data ? prev : event.data));
        }
      };

      ws.current.onclose = (event) => {
        console.warn("WebSocket closed:", event.code, event.reason);
        setIsConnected(false);
        ws.current = null; // Clear reference

        // Attempt reconnection if it's not a normal close (code 1000)
        if (event.code !== 1000 && reconnectAttempt < maxReconnectAttempts) {
          setTimeout(() => {
            setReconnectAttempt((prev) => prev + 1);
            connectWebSocket();
          }, reconnectDelay);
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }, [reconnectAttempt]);

  useEffect(() => {
    if (!ws.current) {
      connectWebSocket();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, []); // Run once on mount

  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || !ws.current) return;

    try {
      ws.current.send(content);
      setMessages((prev) => [
        ...prev,
        { content, role: "user", timestamp: new Date().toLocaleTimeString() },
      ]);
      setInput("");
      setIsLoading(true);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { content: "Error sending message. Please try again.", role: "system", timestamp: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ws.current) return;
  
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Data = reader.result?.toString().split(",")[1]; // Extract base64 content
  
        if (base64Data) {
          ws.current?.send(JSON.stringify({
            type: "file_upload",
            fileName: file.name,
            fileData: base64Data
          }));
  
          // Request processing after upload
          setTimeout(() => {
            ws.current?.send(JSON.stringify({ type: "process_file" }));
          }, 1000);
        }
      };
  
      setMessages((prev) => [
        ...prev,
        { content: `Uploading file: ${file.name}`, role: "user", timestamp: new Date().toLocaleTimeString() },
      ]);
  
    } catch (error) {
      console.error("File upload error:", error);
      setMessages((prev) => [
        ...prev,
        { content: "Error uploading file. Please try again.", role: "system", timestamp: new Date().toLocaleTimeString() },
      ]);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col">  {/* Increase chat height */}
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      Chat Assistant
      <div className="flex items-center gap-2">
        <span className={cn("inline-block h-2 w-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
        <span className="text-sm text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
      </div>
    </CardTitle>
  </CardHeader>

  <CardContent className="flex-1 overflow-hidden">
  <ScrollArea className="h-full pr-4">
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "flex w-fit max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2 text-sm break-words", // Adjusted width dynamically
            message.role === "user"
              ? "ml-auto bg-primary text-primary-foreground" // Align user messages right
              : message.role === "system"
                ? "mx-auto bg-muted/50 text-muted-foreground" // System messages centered
                : "bg-muted text-left" // Align agent messages left
          )}
        >
          <div>{message.content}</div>
          <div className="text-xs opacity-50">{message.timestamp}</div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  </ScrollArea>
</CardContent>


  <CardFooter className="p-4 bg-white">
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

      {latestAgentResponse === "Great choice. Kindly drop here." && (
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0"
        >
          <Paperclip className="h-4 w-4" />
          <span className="sr-only">Attach file</span>
        </Button>
      )}

      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-grow h-12 text-lg"  // Larger input field
      />
      <Button type="submit" size="icon" disabled={!isConnected} className="h-12 w-12">
        <Send className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  </CardFooter>
</Card>

  );
}

