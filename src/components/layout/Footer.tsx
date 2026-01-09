import { Github } from "lucide-react";

type Props = {
    className?: string;
    version?: string;
};

export default function Footer({ className, version }: Props) {
    const year = new Date().getFullYear();
    return (
        <footer className={className ?? "app-footer"} style={{ padding: "12px 16px", fontSize: 13, color: "#666" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <div>
                    NamazNow {version ? `v${version} ` : ""}• © {year}
                </div>
                <div style={{ color: "#444" }}>•</div>
                <div>
                    Data sources:
                    <a
                        href="https://openstreetmap.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginLeft: 6 }}
                    >
                        OpenStreetMap
                    </a>
                    <span style={{ margin: "0 6px" }}>/</span>
                    <a
                        href="https://nominatim.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Nominatim
                    </a>
                </div>
                <div style={{ marginLeft: "auto" }}>
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
                        <span>View Source</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}