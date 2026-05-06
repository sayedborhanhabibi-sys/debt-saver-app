
import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [asideOpen, setAsideOpen] = useState(false);
    const [inputs, setInputs] = useState({
        name: "",
        qarz: "",
        maqdar: "",
        modul: "",
        discrip: "",
    });
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem("debtItems");
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch (error) {
            console.warn("localStorage parse failed", error);
            return [];
        }
    });
    const [searchText, setSearchText] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [offline, setOffline] = useState(!navigator.onLine);

    useEffect(() => {
        localStorage.setItem("debtItems", JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        const handleOnline = () => setOffline(false);
        const handleOffline = () => setOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(searchText.trim());
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchText]);

    const searchQuery = debouncedSearch.toLowerCase();

    const filteredItems = items.filter((item) => {
        if (!searchQuery) return true;
        return [item.name, item.qarz, item.maqdar, item.modul, item.discrip, item.date]
            .join(" ")
            .toLowerCase()
            .includes(searchQuery);
    });

    function toggleAside(open) {
        setAsideOpen(open);
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    }

    function handleSearchChange(event) {
        setSearchText(event.target.value);
    }

    function escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function highlightText(text, query) {
        if (!query) return text;
        const escaped = escapeRegExp(query);
        const regex = new RegExp(`(${escaped})`, "gi");
        return text.split(regex).map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="match">
                    {part}
                </span>
            ) : (
                part
            )
        );
    }

    function save() {
        const { qarz, maqdar, modul, discrip } = inputs;

        if (!qarz || !maqdar || !modul || !discrip) {
            alert("please write full");
            return;
        }

        const newItem = {
            id: editingId || Date.now(),
            name: inputs.name,
            qarz,
            maqdar,
            modul,
            discrip,
            date: new Date().toLocaleDateString("fa-IR"),
        };

        if (editingId) {
            setItems((prev) => prev.map((item) => (item.id === editingId ? newItem : item)));
            setEditingId(null);
        } else {
            setItems((prev) => [...prev, newItem]);
        }

        setInputs({ name: "", qarz: "", maqdar: "", modul: "", discrip: "" });
    }

    function startEdit(itemId) {
        const item = items.find((itemEntry) => itemEntry.id === itemId);
        if (!item) return;
        setInputs({ name: item.name,
                    qarz: item.qarz,
                    maqdar: item.maqdar,
                    modul: item.modul,
                    discrip: item.discrip
                });
        setEditingId(itemId);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function removeItem(itemId) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
    }

    function clearStorage() {
        setItems([]);
        localStorage.removeItem("debtItems");
        setSearchText("");
        setEditingId(null);
    }

    function highlightItem(itemId) {
        const element = document.getElementById(`item-${itemId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("highlight");
            setTimeout(() => element.classList.remove("highlight"), 1200);
        }
    }

    return (
        <div dir="rtl" className="App" lang="pash">
            <nav className="nav">
                <div className="box-in-nav">
                    <button onClick={() => toggleAside(true)} className="logo">
                        &#9776;
                    </button>
                    <h1>📒 د قرضدارانو لیست</h1>
                </div>
                <h2>Debt Manager</h2>
            </nav>

            <aside className={`aside ${asideOpen ? "" : "hidasid"}`}>
                <button onClick={() => toggleAside(false)} className="close-asid-btn">
                    ❌
                </button>
                <button>Home</button>
                <button>About</button>
                <button onClick={clearStorage}>Clear Storage</button>
                <button>Setting</button>
                <button>Background Color</button>
                <button>Exit</button>
            </aside>

            <header>
                <div className="first-box">📋 د قرضدارانو لیست</div>
                <div className="second-box">💵 بلانس</div>
            </header>

            <div className="inputs-box">
                <div className="serch-box">
                    <button>🔍</button>
                    <input
                        type="search"
                        value={searchText}
                        onChange={handleSearchChange}
                        placeholder="سرچ"
                    />
                    <div className="plac-logo">➕</div>
                </div>
                {searchText.trim() && (
                    <div className="search-results">
                        {filteredItems.length > 0 ? (
                            filteredItems.slice(0, 5).map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        highlightItem(item.id);
                                        setSearchText(item.name);
                                    }}
                                >
                                    {highlightText(item.name, searchQuery)} - {highlightText(item.qarz, searchQuery)} - {highlightText(item.modul, searchQuery)}
                                </button>
                            ))
                        ) : (
                            <div className="search-empty">هیڅ څه ونه موندل شول</div>
                        )}
                    </div>
                )}

                <div className="input2box">
                    <input
                        name="name"
                        value={inputs.name}
                        onChange={handleChange}
                        type="text"
                        placeholder="👤 د قرضدار نوم"
                    />
                    <input
                        name="qarz"
                        value={inputs.qarz}
                        onChange={handleChange}
                        type="text"
                        placeholder="💰 قرضه/ رسید"
                    />
                    <input
                        name="maqdar"
                        value={inputs.maqdar}
                        onChange={handleChange}
                        type="number"
                        placeholder="💵 د پیسو مقدار"
                    />
                    <input
                        name="modul"
                        value={inputs.modul}
                        onChange={handleChange}
                        type="text"
                        placeholder="💱 د پیسو ډول"
                    />
                </div>

                <input
                    name="discrip"
                    value={inputs.discrip}
                    onChange={handleChange}
                    className="discrip-input"
                    type="text"
                    placeholder="📝 تفصیل ولیکی"
                />
                <button onClick={save} className="save-btn">
                    {editingId ? "✏ تازه کول" : "✔ ثبتول"}
                </button>
            </div>

            <div className="list-box">
                <h2>⬇ د قرضونو لیست</h2>
                <div className="list-table">
                    <div className="list-row list-header">
                        <span>قرضدار</span>
                        <span>قرض/رسید</span>
                        <span>مقدار</span>
                        <span>ډول</span>
                        <span>تفصیل</span>
                        <span>نېټه</span>
                        <span>عمل</span>
                    </div>
                    {filteredItems.length === 0 ? (
                        <div className="empty-list">هیڅ توکي نشته. لومړی ثبت کړئ.</div>
                    ) : (
                        filteredItems.map((item) => (
                            <div className="list-row" id={`item-${item.id}`} key={item.id}>
                                <span>{highlightText(item.name, searchQuery)}</span>
                                <span>{highlightText(item.qarz, searchQuery)}</span>
                                <span>{highlightText(item.maqdar, searchQuery)}</span>
                                <span>{highlightText(item.modul, searchQuery)}</span>
                                <span>{highlightText(item.discrip, searchQuery)}</span>
                                <span>{highlightText(item.date, searchQuery)}</span>
                                <div className="row-actions">
                                    <button className="edit-btn" onClick={() => startEdit(item.id)}>
                                        ✏ ایډیټ
                                    </button>
                                    <button className="delete-btn" onClick={() => removeItem(item.id)}>
                                        🗑 حذف
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;