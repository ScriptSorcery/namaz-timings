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
                    Namaz Timings {version ? `v${version} ` : ""}• © {year}
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
                <div style={{ marginLeft: "auto", opacity: 0.9 }}>
                    <a
                        href="https://github.com/ScriptSorcery/namaz-timings"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "inherit" }}
                    >
                        Source
                    </a>
                </div>
            </div>
        </footer>
    );
}