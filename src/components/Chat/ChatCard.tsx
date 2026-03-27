"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/auth/AuthContext";
import { LoaderSmall } from "../common/Loader";

interface Conversation {
  id: string;
  participantId: string;
  participantName?: string;
  lastMessage?: {
    content: string;
    timestamp: Date;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface BrowseReport {
  id: string;
  userId: string;
  fullName: string;
  idType: string;
  description: string;
  reportType: "lost" | "found";
  createdAt: Date;
  hasConversation?: boolean;
}

const ChatCard = () => {
  const { user, getIdToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"browse" | "chats">("browse");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [browseReports, setBrowseReports] = useState<BrowseReport[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchBrowseReports();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const idToken = await getIdToken();
      const response = await fetch("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const result = await response.json();

      if (result.success) {
        const convsWithNames = await Promise.all(
          result.data.map(async (conv: any) => {
            try {
              const userResponse = await fetch(
                `/api/users/${conv.participantId}`,
                { headers: { Authorization: `Bearer ${idToken}` } }
              );
              const userData = await userResponse.json();
              return {
                ...conv,
                participantName: userData.name || conv.participantId.slice(0, 8),
              };
            } catch {
              return {
                ...conv,
                participantName: conv.participantId.slice(0, 8),
              };
            }
          })
        );
        setConversations(convsWithNames);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrowseReports = async () => {
    if (!user) return;

    try {
      const idToken = await getIdToken();
      const response = await fetch("/api/chat/browse", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const result = await response.json();

      if (result.success) {
        setBrowseReports(result.data);
      }
    } catch (error) {
      console.error("Error fetching browse reports:", error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      const idToken = await getIdToken();
      const response = await fetch(
        `/api/chat/messages?conversationId=${conversationId}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      const result = await response.json();

      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const startConversation = async (report: BrowseReport) => {
    if (!user) return;

    try {
      setSending(true);
      const idToken = await getIdToken();

      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          matchedUserId: report.userId,
          content: `Hi! I ${report.reportType === "lost" ? "found" : "lost"} a ${report.idType} and would like to help connect you with your ${report.reportType === "lost" ? "lost" : "found"} item.`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchBrowseReports();
        await fetchConversations();
        setActiveTab("chats");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const conversation = conversations.find((c) => c.id === selectedChat);
    if (!conversation) return;

    try {
      setSending(true);
      const idToken = await getIdToken();

      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          conversationId: selectedChat,
          receiverId: conversation.participantId,
          content: newMessage,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
        setNewMessage("");
        await fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const filteredReports = filterType
    ? browseReports.filter((r) => r.idType === filterType)
    : browseReports;

  const uniqueIdTypes = [...new Set(browseReports.map((r) => r.idType))];

  if (!user) {
    return (
      <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
          Messages
        </h4>
        <div className="px-7.5 py-8 text-center">
          <p className="text-gray-500">Sign in to view messages</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
          Messages
        </h4>
        <div className="flex items-center justify-center py-12">
          <LoaderSmall />
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="border-b border-stroke dark:border-strokedark">
        <div className="flex">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "browse"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "chats"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            Chats {conversations.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                {conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {selectedChat ? (
        <div className="flex h-[500px] flex-col">
          <div className="flex items-center gap-3 border-b border-stroke px-4 py-3 dark:border-strokedark">
            <button
              onClick={() => setSelectedChat(null)}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-meta-4"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <p className="font-medium text-black dark:text-white">
                {conversations.find((c) => c.id === selectedChat)?.participantName || "Chat"}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.isOwn
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-black dark:bg-meta-4 dark:text-white"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`mt-1 text-xs ${msg.isOwn ? "text-white/70" : "text-gray-500"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 border-t border-stroke px-4 py-3 dark:border-strokedark">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 rounded border border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-form-input"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="rounded bg-primary px-3 py-2 text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      ) : activeTab === "browse" ? (
        <div className="max-h-[500px] overflow-y-auto">
          {browseReports.length > 0 && (
            <div className="px-4 py-3 border-b border-stroke dark:border-strokedark">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-form-input"
              >
                <option value="">All ID Types</option>
                {uniqueIdTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}
          
          {browseReports.length === 0 ? (
            <div className="px-7.5 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-3 text-gray-500 font-medium">Submit a report first</p>
              <p className="mt-2 text-sm text-gray-400">
                Report a Lost or Found ID to see matching reports.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <a 
                  href="/forms/reportCardForm"
                  className="inline-block rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
                >
                  Report Lost ID
                </a>
                <a 
                  href="/forms/foundCardForm"
                  className="inline-block rounded border border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:bg-opacity-10"
                >
                  Report Found ID
                </a>
              </div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="px-7.5 py-8 text-center">
              <p className="text-gray-500">No reports for this ID type.</p>
              <button 
                onClick={() => setFilterType("")}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Show all reports
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stroke dark:divide-strokedark">
              {filteredReports.map((report) => (
                <div key={report.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-meta-4/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            report.reportType === "lost"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {report.reportType.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 font-medium text-black dark:text-white">
                        {report.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {report.idType}
                      </p>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {report.description}
                      </p>
                    </div>
                    <button
                      onClick={() => startConversation(report)}
                      disabled={sending || report.hasConversation}
                      className={`rounded px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
                        report.hasConversation
                          ? "bg-gray-100 text-gray-500 cursor-default"
                          : "bg-primary text-white hover:bg-opacity-90"
                      }`}
                    >
                      {report.hasConversation ? "Contacted" : "Contact"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-h-[500px] overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="px-7.5 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="mt-3 text-gray-500 font-medium">No messages yet</p>
              <p className="mt-2 text-sm text-gray-400">
                Go to <strong>Browse</strong> tab and click <strong>Contact</strong> on a report to start chatting.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stroke dark:divide-strokedark">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-meta-4/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-medium text-lg">
                    {(conv.participantName || "U")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-black dark:text-white truncate">
                        {conv.participantName || "User"}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatCard;
