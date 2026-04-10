import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

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
      `<strong style="color:#e2e8f0;font-weight:600;">$1</strong>`,
    )
    .replace(
      /\*(.+?)\*/g,
      `<em style="color:#a5b4fc;font-style:italic;">$1</em>`,
    )
    .replace(
      /`(.+?)`/g,
      `<code style="background:#1e293b;color:#2dd4bf;padding:2px 7px;border-radius:4px;font-size:12.5px;font-family:monospace;">$1</code>`,
    );
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
        `<h3 style="font-size:14px;font-weight:700;color:#e2e8f0;margin:16px 0 5px;">${inlineFmt(l.slice(4))}</h3>`,
      );
      i++;
      continue;
    }
    if (l.startsWith("## ")) {
      out.push(
        `<h2 style="font-size:17px;font-weight:700;color:#f1f5f9;margin:18px 0 8px;padding-bottom:6px;border-bottom:1px solid rgba(20,184,166,0.2);">${inlineFmt(l.slice(3))}</h2>`,
      );
      i++;
      continue;
    }
    if (l.startsWith("# ")) {
      out.push(
        `<h1 style="font-size:20px;font-weight:800;color:#f1f5f9;margin:18px 0 10px;">${inlineFmt(l.slice(2))}</h1>`,
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
      out.push(
        `<div style="background:#0f172a;border:1px solid rgba(20,184,166,0.18);border-radius:9px;margin:12px 0;overflow:hidden;">${lang ? `<div style="padding:5px 14px;background:rgba(20,184,166,0.07);font-size:11px;color:#64748b;font-family:monospace;letter-spacing:.05em;border-bottom:1px solid rgba(20,184,166,0.12);">${esc(lang)}</div>` : ""}<pre style="margin:0;padding:14px;overflow-x:auto;font-size:13px;line-height:1.65;color:#94a3b8;font-family:'Fira Code',monospace;">${code.map(esc).join("\n")}</pre></div>`,
      );
      i++;
      continue;
    }
    if (l.match(/^[-*] /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(
          `<li style="margin:5px 0;padding-left:4px;color:#cbd5e1;display:flex;gap:8px;"><span style="color:#14b8a6;flex-shrink:0;">▸</span><span>${inlineFmt(lines[i].slice(2))}</span></li>`,
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
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(
          `<li style="margin:6px 0;color:#cbd5e1;display:flex;gap:10px;"><span style="color:#14b8a6;font-weight:700;flex-shrink:0;min-width:18px;">${n}.</span><span>${inlineFmt(lines[i].replace(/^\d+\. /, ""))}</span></li>`,
        );
        i++;
        n++;
      }
      out.push(
        `<ol style="margin:8px 0;padding:0;list-style:none;">${items.join("")}</ol>`,
      );
      continue;
    }
    if (l.startsWith("> ")) {
      out.push(
        `<blockquote style="border-left:3px solid #14b8a6;margin:10px 0;padding:8px 16px;background:rgba(20,184,166,0.06);border-radius:0 7px 7px 0;color:#94a3b8;font-style:italic;">${inlineFmt(l.slice(2))}</blockquote>`,
      );
      i++;
      continue;
    }
    if (l.match(/^---+$/)) {
      out.push(
        `<hr style="border:none;border-top:1px solid rgba(20,184,166,0.15);margin:14px 0;">`,
      );
      i++;
      continue;
    }
    if (l.trim() === "") {
      out.push(`<div style="height:7px;"></div>`);
      i++;
      continue;
    }
    out.push(
      `<p style="margin:5px 0;color:#cbd5e1;line-height:1.78;">${inlineFmt(l)}</p>`,
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
        gap: 12,
        alignItems: "flex-start",
        animation: "fadeUp .3s ease forwards",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#0d9488,#0891b2)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        A
      </div>
      <div
        style={{
          background: "rgba(15,23,42,0.8)",
          border: "1px solid rgba(20,184,166,0.15)",
          borderRadius: "0 12px 12px 12px",
          padding: "14px 18px",
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#14b8a6",
              display: "inline-block",
              animation: `typingBounce 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.18}s`,
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
        gap: 12,
        alignItems: "flex-start",
        flexDirection: u ? "row-reverse" : "row",
        animation: "fadeUp .3s ease forwards",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
          background: u
            ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
            : "linear-gradient(135deg,#0d9488,#0891b2)",
          color: "#fff",
          boxShadow: u
            ? "0 0 14px rgba(99,102,241,0.3)"
            : "0 0 14px rgba(13,148,136,0.3)",
        }}
      >
        {u ? "U" : "A"}
      </div>
      {u ? (
        <div
          style={{
            maxWidth: "70%",
            padding: "11px 16px",
            background:
              "linear-gradient(135deg,rgba(99,102,241,0.22),rgba(139,92,246,0.18))",
            border: "1px solid rgba(139,92,246,0.28)",
            borderRadius: "12px 0 12px 12px",
            color: "#e2e8f0",
            fontSize: 14,
            lineHeight: 1.75,
          }}
        >
          {m.text}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            background: "rgba(15,23,42,0.65)",
            border: "1px solid rgba(20,184,166,0.12)",
            borderRadius: "0 12px 12px 12px",
            padding: "14px 18px",
            fontSize: 14,
          }}
          dangerouslySetInnerHTML={{ __html: renderMd(m.text) }}
        />
      )}
    </div>
  );
}

function ActionBar({ onNew, onEnd }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 10,
        padding: "12px 0",
        animation: "fadeUp .4s ease forwards",
      }}
    >
      {[
        {
          label: "New Chat",
          icon: "M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6a6 6 0 01-6 6 6 6 0 01-6-6H4a8 8 0 008 8 8 8 0 008-8c0-4.42-3.58-8-8-8z",
          color: "#2dd4bf",
          border: "rgba(20,184,166,0.35)",
          bg: "rgba(20,184,166,0.08)",
          hBg: "rgba(20,184,166,0.18)",
          onClick: onNew,
        },
        {
          label: "End Chat",
          icon: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
          color: "#f87171",
          border: "rgba(239,68,68,0.3)",
          bg: "rgba(239,68,68,0.07)",
          hBg: "rgba(239,68,68,0.15)",
          onClick: onEnd,
        },
      ].map((b) => (
        <button
          key={b.label}
          onClick={b.onClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            borderRadius: 10,
            border: `1px solid ${b.border}`,
            background: b.bg,
            color: b.color,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = b.hBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = b.bg;
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d={b.icon} />
          </svg>
          {b.label}
        </button>
      ))}
    </div>
  );
}

function EndBanner({ onNew }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "28px 0",
        animation: "fadeUp .4s ease forwards",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#f87171">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      </div>
      <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
        Conversation ended
      </p>
      <button
        onClick={onNew}
        style={{
          padding: "10px 24px",
          borderRadius: 10,
          border: "none",
          background: "linear-gradient(135deg,#0d9488,#0891b2)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(13,148,136,0.35)",
          transition: "transform .15s, opacity .15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        Start New Chat
      </button>
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
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const prevResult = useRef("");
  const bottomRef = useRef(null);

  const onSubmit = async (data) => {
    const res = await axios.post("http://localhost:8000/chat", data);
    setResult(res.data.messages);
  };

  useEffect(() => {
    if (result && result !== prevResult.current) {
      prevResult.current = result;
      setHistory((h) => [...h, { role: "ai", text: result }]);
      setLoading(false);
      setShowActions(true);
    }
  }, [result]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const submit = async (data) => {
    if (!data.messages?.trim() || ended) return;
    setShowActions(false);
    setHistory((h) => [...h, { role: "user", text: data.messages }]);
    setLoading(true);
    reset();
    await onSubmit(data);
  };

  const handleNew = () => {
    setHistory([]);
    setResult("");
    prevResult.current = "";
    setLoading(false);
    setEnded(false);
    setShowActions(false);
    reset();
  };
  const handleEnd = () => {
    setEnded(true);
    setShowActions(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        background: "#060b14",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        color: "#e2e8f0",
        overflow: "hidden",
      }}
    >
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
              "radial-gradient(circle,rgba(13,148,136,0.07) 0%,transparent 65%)",
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
              "radial-gradient(circle,rgba(8,145,178,0.06) 0%,transparent 65%)",
          }}
        />
      </div>

      {/* Header */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          padding: "13px 24px",
          borderBottom: "1px solid rgba(20,184,166,0.1)",
          backdropFilter: "blur(20px)",
          background: "rgba(6,11,20,0.88)",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg,#0d9488,#0891b2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 800,
            color: "#fff",
            boxShadow: "0 0 18px rgba(13,148,136,0.4)",
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
              color: "#f1f5f9",
              letterSpacing: "0.02em",
            }}
          >
            ARIA
          </div>
          <div
            style={{ fontSize: 10, color: "#475569", letterSpacing: "0.1em" }}
          >
            AI ASSISTANT
          </div>
        </div>
      </header>

      {/* Messages */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          overflowY: "auto",
          padding: "28px 0",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(13,148,136,0.22) transparent",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px" }}>
          {history.length === 0 && !ended ? (
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
                    background: "linear-gradient(135deg,#0d9488,#0891b2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 900,
                    color: "#fff",
                    margin: "0 auto 20px",
                    boxShadow: "0 0 40px rgba(13,148,136,0.45)",
                    animation: "float 3s ease-in-out infinite",
                  }}
                >
                  A
                </div>
                <h1
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: "#f1f5f9",
                    margin: "0 0 8px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Hello, I'm{" "}
                  <span
                    style={{
                      background: "linear-gradient(90deg,#2dd4bf,#38bdf8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ARIA
                  </span>
                </h1>
                <p style={{ color: "#475569", fontSize: 15, margin: 0 }}>
                  Your AI companion — ask me anything
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
                      border: "1px solid rgba(20,184,166,0.15)",
                      background: "rgba(13,148,136,0.06)",
                      color: "#94a3b8",
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all .2s",
                      lineHeight: 1.4,
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(13,148,136,0.13)";
                      e.currentTarget.style.color = "#e2e8f0";
                      e.currentTarget.style.borderColor =
                        "rgba(20,184,166,0.35)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(13,148,136,0.06)";
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.borderColor =
                        "rgba(20,184,166,0.15)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span style={{ color: "#14b8a6", marginRight: 8 }}>
                      {h.icon}
                    </span>
                    {h.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {history.map((m, i) => (
                <Message key={i} m={m} />
              ))}
              {loading && <TypingDots />}
              {showActions && !loading && !ended && (
                <ActionBar onNew={handleNew} onEnd={handleEnd} />
              )}
              {ended && <EndBanner onNew={handleNew} />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
          padding: "12px 20px 20px",
          backdropFilter: "blur(20px)",
          background: "rgba(6,11,20,0.92)",
          borderTop: "1px solid rgba(20,184,166,0.08)",
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
              background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(20,184,166,0.18)",
              borderRadius: 14,
              padding: "12px 14px",
              transition: "border-color .2s",
            }}
            onFocusCapture={(e) =>
              (e.currentTarget.style.borderColor = "rgba(20,184,166,0.45)")
            }
            onBlurCapture={(e) =>
              (e.currentTarget.style.borderColor = "rgba(20,184,166,0.18)")
            }
          >
            <textarea
              rows={1}
              placeholder={
                ended ? "Start a new chat to continue…" : "Message ARIA…"
              }
              disabled={ended}
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
                color: "#e2e8f0",
                fontSize: 14,
                resize: "none",
                maxHeight: 140,
                lineHeight: 1.65,
                fontFamily: "inherit",
                opacity: ended ? 0.4 : 1,
                cursor: ended ? "not-allowed" : "text",
              }}
              {...register("messages", { required: "Enter a message!" })}
            />
            <button
              type="button"
              disabled={loading || ended}
              onClick={handleSubmit(submit)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                border: "none",
                flexShrink: 0,
                background:
                  loading || ended
                    ? "rgba(13,148,136,0.25)"
                    : "linear-gradient(135deg,#0d9488,#0891b2)",
                color: "#fff",
                cursor: loading || ended ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform .15s",
                boxShadow: "0 0 16px rgba(13,148,136,0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading && !ended)
                  e.currentTarget.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {loading ? (
                <svg
                  style={{ animation: "spin 1s linear infinite" }}
                  width="16"
                  height="16"
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="currentColor"
                    strokeWidth="2.2"
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
              color: "#1e293b",
              marginTop: 8,
              letterSpacing: "0.08em",
            }}
          >
            POWERED BY GPT-4o · LANGCHAIN
          </p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes typingBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(13,148,136,0.25);border-radius:4px}
      `}</style>
    </div>
  );
}
