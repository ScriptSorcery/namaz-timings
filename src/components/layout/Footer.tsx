import { Github } from "lucide-react";

type Props = {
    className?: string;
    version?: string;
};

export default function Footer({ className, version }: Props) {
    const year = new Date().getFullYear();
    return (
        <footer className={className ?? "app-footer"} style={{ padding: "12px 16px", fontSize: 13, color: "#666" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
                <div style={{ justifySelf: "start" }}>
                    <a
                        href="https://github.com/ScriptSorcery/namaz-timings"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            backgroundColor: "#24292e",
                            color: "#fff",
                            borderRadius: 6,
                            textDecoration: "none",
                            fontSize: 13,
                            fontWeight: 500,
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#1a1e22";
                            e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#24292e";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        <Github size={16} />
                    </a>
                </div>
                <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                    NamazNow {version ? `v${version} ` : ""}• © {year}
                </div>
                <div style={{ justifySelf: "end" }}></div>
            </div>
        </footer>
    );
}