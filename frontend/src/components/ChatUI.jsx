import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

const HINTS = [
  { icon: "✦", text: "Write a poem about midnight" },
  { icon: "◈", text: "Explain black holes simply" },
  { icon: "⬡", text: "Give me a startup idea" },
  { icon: "◎", text: "What makes great UI?" },
];

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineFmt(str) {
  return esc(str)
    .replace(
      /\*\*(.+?)\*\*/g,
      `<strong style="color:#e6c87a;font-weight:600;">$1</strong>`,
    )
    .replace(
      /\*(.+?)\*/g,
      `<em style="color:#c9a84c;font-style:italic;">$1</em>`,
    )
    .replace(
      /`(.+?)`/g,
      `<code style="background:rgba(180,148,80,0.12);color:#c9a84c;padding:2px 7px;border-radius:4px;font-size:12px;font-family:monospace;">$1</code>`,
    );
}

let _codeBlockId = 0;
function nextCodeId() {
  return `cb_${++_codeBlockId}`;
}

function renderMd(text) {
  if (!text) return "";
  const lines = text.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("### ")) {
      out.push(
        `<h3 style="font-size:13px;font-weight:600;color:#c9a84c;margin:14px 0 5px;">${inlineFmt(l.slice(4))}</h3>`,
      );
      i++;
      continue;
    }
    if (l.startsWith("## ")) {
      out.push(
        `<h2 style="font-size:15px;font-weight:600;color:#e6c87a;margin:16px 0 7px;padding-bottom:5px;border-bottom:1px solid rgba(180,148,80,0.18);">${inlineFmt(l.slice(3))}</h2>`,
      );
      i++;
      continue;
    }
    if (l.startsWith("# ")) {
      out.push(
        `<h1 style="font-size:18px;font-weight:700;color:#f0e6c8;margin:16px 0 8px;">${inlineFmt(l.slice(2))}</h1>`,
      );
      i++;
      continue;
    }
    if (l.startsWith("#### ")) {
      out.push(
        `<h4 style="font-size:13px;font-weight:700;color:#94a3b8;margin:14px 0 4px;text-transform:uppercase;letter-spacing:0.06em;">${inlineFmt(l.slice(5))}</h4>`,
      );
      i++;
      continue;
    }
    if (l.startsWith("```")) {
      const lang = l.slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      const rawCode = code.join("\n");
      const id = nextCodeId();
      window[`__code_${id}`] = rawCode;
      out.push(
        `<div style="background:rgba(0,0,0,0.38);border:1px solid rgba(180,148,80,0.13);border-radius:10px;margin:12px 0;overflow:hidden;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 12px;background:rgba(180,148,80,0.07);border-bottom:1px solid rgba(180,148,80,0.1);">
            <span style="font-size:10px;color:rgba(180,148,80,0.5);font-family:monospace;letter-spacing:.06em;">${lang ? esc(lang) : "code"}</span>
            <button id="copybtn_${id}" onclick="(function(){var raw=window['__code_${id}'];navigator.clipboard.writeText(raw).then(function(){var b=document.getElementById('copybtn_${id}');b.innerHTML='<svg width=&quot;11&quot; height=&quot;11&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot;><path d=&quot;M5 13l4 4L19 7&quot; stroke=&quot;#4ade80&quot; stroke-width=&quot;2.5&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;/></svg> <span style=&quot;color:#4ade80;&quot;>Copied!</span>';setTimeout(function(){b.innerHTML='<svg width=&quot;11&quot; height=&quot;11&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot;><rect x=&quot;9&quot; y=&quot;9&quot; width=&quot;13&quot; height=&quot;13&quot; rx=&quot;2&quot; stroke=&quot;rgba(180,148,80,0.6)&quot; stroke-width=&quot;2&quot;/><path d=&quot;M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1&quot; stroke=&quot;rgba(180,148,80,0.6)&quot; stroke-width=&quot;2&quot;/></svg> <span>Copy</span>';},2000);});})();" style="display:flex;align-items:center;gap:5px;background:rgba(180,148,80,0.08);border:1px solid rgba(180,148,80,0.22);border-radius:5px;padding:3px 9px;cursor:pointer;font-size:11px;color:rgba(180,148,80,0.65);font-family:inherit;" onmouseover="this.style.background='rgba(180,148,80,0.18)';this.style.color='rgba(230,200,122,0.95)';" onmouseout="this.style.background='rgba(180,148,80,0.08)';this.style.color='rgba(180,148,80,0.65)';">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="rgba(180,148,80,0.6)" stroke-width="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="rgba(180,148,80,0.6)" stroke-width="2"/></svg>
              <span>Copy</span>
            </button>
          </div>
          <pre style="margin:0;padding:14px;overflow-x:auto;font-size:12.5px;line-height:1.7;color:#8a9bb0;font-family:'Fira Code',monospace;">${code.map(esc).join("\n")}</pre>
        </div>`,
      );
      i++;
      continue;
    }
    if (l.match(/^[-*] /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(
          `<li style="margin:5px 0;padding-left:4px;color:#b8a882;display:flex;gap:8px;"><span style="color:#c9a84c;flex-shrink:0;">›</span><span>${inlineFmt(lines[i].slice(2))}</span></li>`,
        );
        i++;
      }
      out.push(
        `<ul style="margin:8px 0;padding:0;list-style:none;">${items.join("")}</ul>`,
      );
      continue;
    }
    if (l.match(/^\d+\. /)) {
      const items = [];
      let n = 1;
      while (i < lines.length) {
        const cur = lines[i];
        if (cur.match(/^\d+\. /)) {
          items.push(
            `<li style="margin:6px 0;color:#b8a882;display:flex;gap:10px;align-items:baseline;"><span style="color:#c9a84c;font-weight:600;flex-shrink:0;min-width:18px;">${n}.</span><span>${inlineFmt(cur.replace(/^\d+\. /, ""))}</span></li>`,
          );
          n++;
          i++;
        } else if (cur.trim() === "" && lines[i + 1]?.match(/^\d+\. /)) {
          i++;
        } else {
          break;
        }
      }
      out.push(
        `<ol style="margin:8px 0;padding:0;list-style:none;">${items.join("")}</ol>`,
      );
      continue;
    }
    if (l.startsWith("> ")) {
      out.push(
        `<blockquote style="border-left:2px solid rgba(180,148,80,0.4);margin:10px 0;padding:8px 14px;background:rgba(180,148,80,0.05);border-radius:0 7px 7px 0;color:#a89870;font-style:italic;">${inlineFmt(l.slice(2))}</blockquote>`,
      );
      i++;
      continue;
    }
    if (l.match(/^---+$/)) {
      out.push(
        `<hr style="border:none;border-top:1px solid rgba(180,148,80,0.12);margin:14px 0;">`,
      );
      i++;
      continue;
    }
    if (l.trim() === "") {
      out.push(`<div style="height:6px;"></div>`);
      i++;
      continue;
    }
    out.push(
      `<p style="margin:4px 0;color:#b8a882;line-height:1.78;">${inlineFmt(l)}</p>`,
    );
    i++;
  }
  return out.join("");
}

function TypingDots() {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        animation: "fadeUp .3s ease forwards",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          flexShrink: 0,
          background: "linear-gradient(135deg,#b49450,#e6c87a)",
          color: "#0d1117",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "'Playfair Display',serif",
        }}
      >
        A
      </div>
      <div
        style={{
          background: "rgba(180,148,80,0.05)",
          border: "1px solid rgba(180,148,80,0.1)",
          borderRadius: "0 12px 12px 12px",
          padding: "13px 16px",
          display: "flex",
          gap: 5,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((idx) => (
          <span
            key={idx}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "rgba(180,148,80,0.5)",
              display: "inline-block",
              animation: "typingBounce 1.1s ease-in-out infinite",
              animationDelay: `${idx * 0.16}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Message({ m }) {
  const u = m.role === "user";
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        flexDirection: u ? "row-reverse" : "row",
        animation: "fadeUp .3s ease forwards",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          flexShrink: 0,
          marginTop: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: u ? "inherit" : "'Playfair Display',serif",
          background: u
            ? "linear-gradient(135deg,#7c3aed,#a855f7)"
            : "linear-gradient(135deg,#b49450,#e6c87a)",
          color: "#fff",
          boxShadow: u
            ? "0 0 10px rgba(124,58,237,0.3)"
            : "0 0 10px rgba(180,148,80,0.25)",
        }}
      >
        {u ? "U" : "A"}
      </div>
      {u ? (
        <div
          style={{
            maxWidth: "72%",
            padding: "11px 16px",
            background:
              "linear-gradient(135deg,rgba(124,58,237,0.22),rgba(168,85,247,0.16))",
            border: "1px solid rgba(168,85,247,0.3)",
            borderRadius: "12px 0 12px 12px",
            color: "#ede9fe",
            fontSize: 13.5,
            lineHeight: 1.75,
          }}
        >
          {m.text}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            background: "rgba(180,148,80,0.04)",
            border: "1px solid rgba(180,148,80,0.1)",
            borderRadius: "0 12px 12px 12px",
            padding: "13px 16px",
            fontSize: 13.5,
          }}
          dangerouslySetInnerHTML={{ __html: renderMd(m.text) }}
        />
      )}
    </div>
  );
}

export default function ChatUI() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState("");
  const [threads, setThreads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  useEffect(() => {
    const fetchThreads = async () => {
      const response = await fetch(
        "https://chatbot-langgraph.onrender.com/threads",
      );
      const data = await response.json();
      setThreads(data);
    };
    fetchThreads();
  }, []);

  // Close sidebar on outside click
  useEffect(() => {
    if (!sidebarOpen) return;
    const handler = (e) => {
      if (
        !e.target.closest("#sidebar") &&
        !e.target.closest("#sidebar-toggle")
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sidebarOpen]);

  const handleLoadConvo = async (id) => {
    setThreadId(id);
    setSidebarOpen(false);
    const response = await fetch(
      "https://chatbot-langgraph.onrender.com/chat/load",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: "", threadId: id }),
      },
    );
    const r = await response.json();
    console.log(r);
    setHistory(r.messages);
  };

  const onSubmit = async (data, currentThreadId) => {
    const response = await fetch(
      "https://chatbot-langgraph.onrender.com/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: data.messages,
          threadId: currentThreadId,
        }),
      },
    );

    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let firstChunk = true;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (firstChunk) {
        firstChunk = false;
        setLoading(false);
        setHistory((h) => [...h, { role: "ai", text: chunk }]);
      } else {
        setHistory((h) => {
          const updated = [...h];
          updated[updated.length - 1] = {
            role: "ai",
            text: updated[updated.length - 1].text + chunk,
          };
          return updated;
        });
      }
    }
    reset({ messages: "" });
    setLoading(false);
    const res = await fetch("https://chatbot-langgraph.onrender.com/threads");
    const updatedThreads = await res.json();
    setThreads(updatedThreads);
  };

  const submit = async (data) => {
    if (!data.messages?.trim()) return;

    // ✅ Fix 1: Auto-create thread if none exists
    let currentThreadId = threadId;
    if (!currentThreadId) {
      currentThreadId = uuidv4();
      setThreadId(currentThreadId);
      setThreads((prev) =>
        prev.includes(currentThreadId) ? prev : [...prev, currentThreadId],
      );
    }

    setHistory((h) => [...h, { role: "user", text: data.messages }]);
    setLoading(true);
    reset();
    await onSubmit(data, currentThreadId); // ✅ Pass threadId directly
  };

  const handleNew = () => {
    const thread_id = uuidv4();
    setThreadId(thread_id);
    setThreads((prev) => [...prev, thread_id]);
    setHistory([]);
    setLoading(false);
    reset();
  };

  // Truncate UUID for display
  const shortId = (id) => id.slice(0, 8) + "…";
  const threadIndex = (id) => threads.indexOf(id) + 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        background: "#0d1117",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        color: "#f0e6c8",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "-10%",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(180,148,80,0.05) 0%,transparent 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "50%",
            height: "50%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(124,58,237,0.04) 0%,transparent 65%)",
          }}
        />
      </div>

      {/* ── SIDEBAR OVERLAY ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "all" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* ── SIDEBAR ── */}
      <div
        id="sidebar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100dvh",
          width: 280,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          background: "rgba(11,14,20,0.98)",
          borderRight: "1px solid rgba(180,148,80,0.15)",
          backdropFilter: "blur(24px)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: sidebarOpen ? "4px 0 40px rgba(0,0,0,0.6)" : "none",
        }}
      >
        {/* Sidebar header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: "1px solid rgba(180,148,80,0.1)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "rgba(180,148,80,0.6)" }}
            >
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke="rgba(180,148,80,0.6)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "rgba(180,148,80,0.6)",
                textTransform: "uppercase",
              }}
            >
              Conversations
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(180,148,80,0.4)",
              padding: 4,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color .2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(180,148,80,0.9)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(180,148,80,0.4)")
            }
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* New Chat button inside sidebar */}
        <div style={{ padding: "12px 14px", flexShrink: 0 }}>
          <button
            onClick={() => {
              handleNew();
              setSidebarOpen(false);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 14px",
              borderRadius: 9,
              border: "1px solid rgba(180,148,80,0.22)",
              background: "rgba(180,148,80,0.07)",
              color: "rgba(180,148,80,0.8)",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              letterSpacing: "0.04em",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(180,148,80,0.15)";
              e.currentTarget.style.color = "#e6c87a";
              e.currentTarget.style.borderColor = "rgba(180,148,80,0.42)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(180,148,80,0.07)";
              e.currentTarget.style.color = "rgba(180,148,80,0.8)";
              e.currentTarget.style.borderColor = "rgba(180,148,80,0.22)";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            New Conversation
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(180,148,80,0.08)",
            margin: "0 14px",
            flexShrink: 0,
          }}
        />

        {/* Thread list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px 10px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(180,148,80,0.12) transparent",
          }}
        >
          {threads.length === 0 ? (
            <div
              style={{
                padding: "24px 14px",
                textAlign: "center",
                color: "rgba(180,148,80,0.25)",
                fontSize: 12,
              }}
            >
              No conversations yet
            </div>
          ) : (
            [...threads].reverse().map((id) => {
              const isActive = id === threadId;
              return (
                <button
                  key={id}
                  onClick={() => handleLoadConvo(id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 9,
                    border: `1px solid ${isActive ? "rgba(180,148,80,0.3)" : "transparent"}`,
                    background: isActive
                      ? "rgba(180,148,80,0.1)"
                      : "transparent",
                    color: isActive ? "#e6c87a" : "rgba(180,148,80,0.55)",
                    fontSize: 12.5,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all .18s",
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background =
                        "rgba(180,148,80,0.06)";
                      e.currentTarget.style.color = "rgba(180,148,80,0.8)";
                      e.currentTarget.style.borderColor =
                        "rgba(180,148,80,0.14)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(180,148,80,0.55)";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isActive
                        ? "rgba(180,148,80,0.18)"
                        : "rgba(180,148,80,0.07)",
                      border: `1px solid ${isActive ? "rgba(180,148,80,0.3)" : "rgba(180,148,80,0.1)"}`,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                        stroke={isActive ? "#e6c87a" : "rgba(180,148,80,0.5)"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {/* Label */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 12.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Chat #{threadIndex(id)}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(180,148,80,0.3)",
                        fontFamily: "monospace",
                        marginTop: 1,
                      }}
                    >
                      {shortId(id)}
                    </div>
                  </div>
                  {/* Active dot */}
                  {isActive && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#e6c87a",
                        flexShrink: 0,
                        boxShadow: "0 0 6px rgba(230,200,122,0.6)",
                      }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Sidebar footer */}
        <div
          style={{
            padding: "12px 18px",
            borderTop: "1px solid rgba(180,148,80,0.08)",
            flexShrink: 0,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              color: "rgba(180,148,80,0.2)",
              letterSpacing: "0.06em",
              textAlign: "center",
            }}
          >
            {threads.length} conversation{threads.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── HEADER ── */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 24px",
          borderBottom: "1px solid rgba(180,148,80,0.12)",
          backdropFilter: "blur(20px)",
          background: "rgba(13,17,23,0.96)",
          flexShrink: 0,
        }}
      >
        {/* Left: sidebar toggle + logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Sidebar toggle button */}
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            title="Conversations"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid rgba(180,148,80,0.2)",
              background: sidebarOpen
                ? "rgba(180,148,80,0.14)"
                : "rgba(180,148,80,0.06)",
              color: sidebarOpen ? "#e6c87a" : "rgba(180,148,80,0.55)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(180,148,80,0.16)";
              e.currentTarget.style.color = "#e6c87a";
              e.currentTarget.style.borderColor = "rgba(180,148,80,0.38)";
            }}
            onMouseLeave={(e) => {
              if (!sidebarOpen) {
                e.currentTarget.style.background = "rgba(180,148,80,0.06)";
                e.currentTarget.style.color = "rgba(180,148,80,0.55)";
                e.currentTarget.style.borderColor = "rgba(180,148,80,0.2)";
              }
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="5"
                width="18"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="3"
                y="11"
                width="14"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="3"
                y="17"
                width="10"
                height="2"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Logo */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#b49450,#e6c87a,#b49450)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'Playfair Display',serif",
              color: "#0d1117",
              flexShrink: 0,
            }}
          >
            A
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#f0e6c8",
                letterSpacing: "0.05em",
              }}
            >
              ARIA
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(180,148,80,0.5)",
                letterSpacing: "0.12em",
              }}
            >
              AI ASSISTANT
            </div>
          </div>
        </div>

        {/* New Chat — only shows once a conversation has started */}
        {history.length > 0 && (
          <button
            onClick={handleNew}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 16px",
              borderRadius: 8,
              border: "1px solid rgba(180,148,80,0.25)",
              background: "rgba(180,148,80,0.07)",
              color: "rgba(180,148,80,0.75)",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              letterSpacing: "0.04em",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(180,148,80,0.16)";
              e.currentTarget.style.color = "#e6c87a";
              e.currentTarget.style.borderColor = "rgba(180,148,80,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(180,148,80,0.07)";
              e.currentTarget.style.color = "rgba(180,148,80,0.75)";
              e.currentTarget.style.borderColor = "rgba(180,148,80,0.25)";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6a6 6 0 01-6 6 6 6 0 01-6-6H4a8 8 0 008 8 8 8 0 008-8c0-4.42-3.58-8-8-8z" />
            </svg>
            New Chat
          </button>
        )}
      </header>

      {/* ── MESSAGES ── */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          overflowY: "auto",
          padding: "28px 0",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(180,148,80,0.15) transparent",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px" }}>
          {history.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "calc(100vh - 200px)",
                gap: 28,
                textAlign: "center",
              }}
            >
              <div style={{ animation: "fadeUp .6s ease forwards" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    margin: "0 auto 20px",
                    background:
                      "linear-gradient(135deg,#b49450,#e6c87a,#b49450)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    fontWeight: 700,
                    fontFamily: "'Playfair Display',serif",
                    color: "#0d1117",
                    animation: "float 3s ease-in-out infinite",
                  }}
                >
                  A
                </div>
                <h1
                  style={{
                    fontSize: 34,
                    fontWeight: 700,
                    color: "#f0e6c8",
                    margin: "0 0 8px",
                    letterSpacing: "-0.02em",
                    fontFamily: "'Playfair Display',serif",
                  }}
                >
                  Hello, I'm{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg,#b49450,#e6c87a,#b49450)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ARIA
                  </span>
                </h1>
                <p
                  style={{
                    color: "rgba(240,230,200,0.35)",
                    fontSize: 15,
                    margin: 0,
                  }}
                >
                  Your premium AI companion — ask me anything
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  width: "100%",
                  maxWidth: 480,
                  animation: "fadeUp .8s ease forwards",
                }}
              >
                {HINTS.map((h) => (
                  <button
                    key={h.text}
                    onClick={() => submit({ messages: h.text })}
                    style={{
                      textAlign: "left",
                      padding: "13px 16px",
                      borderRadius: 12,
                      border: "1px solid rgba(180,148,80,0.13)",
                      background: "rgba(180,148,80,0.04)",
                      color: "rgba(240,230,200,0.4)",
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all .2s",
                      lineHeight: 1.4,
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(180,148,80,0.1)";
                      e.currentTarget.style.color = "rgba(240,230,200,0.8)";
                      e.currentTarget.style.borderColor =
                        "rgba(180,148,80,0.32)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(180,148,80,0.04)";
                      e.currentTarget.style.color = "rgba(240,230,200,0.4)";
                      e.currentTarget.style.borderColor =
                        "rgba(180,148,80,0.13)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span style={{ color: "#c9a84c", marginRight: 8 }}>
                      {h.icon}
                    </span>
                    {h.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {history.map((m, idx) => (
                <Message key={idx} m={m} />
              ))}
              {loading && <TypingDots />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      {/* ── DIVIDER ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: 1,
          background: "rgba(180,148,80,0.08)",
          flexShrink: 0,
        }}
      />

      {/* ── FOOTER / INPUT ── */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
          padding: "14px 20px 18px",
          backdropFilter: "blur(20px)",
          background: "rgba(10,13,18,0.96)",
          borderTop: "1px solid rgba(180,148,80,0.08)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {errors.messages && (
            <p
              style={{
                color: "#f87171",
                fontSize: 12,
                marginBottom: 6,
                paddingLeft: 4,
              }}
            >
              ⚠ {errors.messages.message}
            </p>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(180,148,80,0.16)",
              borderRadius: 12,
              padding: "10px 12px",
              transition: "border-color .2s",
            }}
            onFocusCapture={(e) =>
              (e.currentTarget.style.borderColor = "rgba(180,148,80,0.4)")
            }
            onBlurCapture={(e) =>
              (e.currentTarget.style.borderColor = "rgba(180,148,80,0.16)")
            }
          >
            <textarea
              rows={1}
              placeholder="Message ARIA…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(submit)();
                }
              }}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "rgba(240,230,200,0.85)",
                fontSize: 14,
                resize: "none",
                maxHeight: 140,
                lineHeight: 1.65,
                fontFamily: "inherit",
              }}
              {...register("messages", { required: "Enter a message!" })}
            />
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit(submit)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: "none",
                flexShrink: 0,
                background: loading
                  ? "rgba(180,148,80,0.22)"
                  : "linear-gradient(135deg,#b49450,#e6c87a)",
                color: "#0d1117",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform .15s, opacity .15s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = "scale(1.07)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {loading ? (
                <svg
                  style={{ animation: "spin 1s linear infinite" }}
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="30"
                    strokeDashoffset="10"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "rgba(180,148,80,0.28)",
              marginTop: 10,
              letterSpacing: "0.07em",
            }}
          >
            Built by{" "}
            <span style={{ color: "rgba(180,148,80,0.55)", fontWeight: 600 }}>
              Aditya Soran
            </span>
            {" · "}
            <span style={{ color: "rgba(180,148,80,0.38)" }}>
              https://portfolio-gamma-livid-42.vercel.app/
            </span>
          </p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Playfair+Display:wght@500;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes typingBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(180,148,80,0.2); border-radius: 3px; }
      `}</style>
    </div>
  );
}
