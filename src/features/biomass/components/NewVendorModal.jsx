import { useState } from "react";
import { saveNewVendor } from "../biomassService";
import { toast } from "../../../utils/toast";

export default function NewVendorModal({ isOpen, onClose, onSaved }) {
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [representative, setRepresentative] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [sourcingArea, setSourcingArea] = useState("");
  const [poNo, setPoNo] = useState(`2026050${Math.floor(3 + Math.random() * 9)}`);
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [tenure, setTenure] = useState("30.05.2026 to 30.09.2026");
  const [contractedQtyMt, setContractedQtyMt] = useState("1000");
  const [agreedPricePerMt, setAgreedPricePerMt] = useState("1400");

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!companyName) {
      toast.error("Please enter Vendor Company Name");
      return;
    }

    const newVendor = {
      companyName: companyName.toUpperCase(),
      gstin: gstin.toUpperCase() || "09AAAAA0000A1Z5",
      representative,
      contactNo,
      email,
      address,
      sourcingArea: sourcingArea || "Unnao & Surrounding Villages",
      poNo,
      poDate,
      tenure,
      contractedQtyMt: parseFloat(contractedQtyMt) || 1000,
      agreedPricePerMt: parseFloat(agreedPricePerMt) || 1400,
    };

    const updatedList = saveNewVendor(newVendor);
    onSaved(updatedList);
    toast.success(`New Raw Material Vendor "${companyName}" added successfully!`);
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--surface-tint)",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>
              👤 Register New Raw Material Vendor (    )
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Add a new raw straw supplier, contractor, or FPO to the system
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Vendor Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SHREE RAM BIOMASS CONTRACTOR"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                GSTIN Number
              </label>
              <input
                type="text"
                placeholder="e.g. 09IYZPS0291E1ZK"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Representative Name
              </label>
              <input
                type="text"
                placeholder="e.g. Mr. Bhanu Singh"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Contact Mobile *
              </label>
              <input
                type="text"
                placeholder="10-digit mobile"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="vendor@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-secondary)", display: "block", marginBottom: 3 }}>
              Full Office Address
            </label>
            <input
              type="text"
              placeholder="Colony, Tehsil, District, State, Pincode"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid var(--line-strong)" }}
            />
          </div>

          <div style={{ background: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: 8, padding: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>PO Number</label>
              <input type="text" value={poNo} onChange={(e) => setPoNo(e.target.value)} style={{ width: "100%", padding: 5, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
            </div>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Supply Tenure</label>
              <input type="text" value={tenure} onChange={(e) => setTenure(e.target.value)} style={{ width: "100%", padding: 5, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
            </div>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Contracted Qty (MT)</label>
              <input type="number" value={contractedQtyMt} onChange={(e) => setContractedQtyMt(e.target.value)} style={{ width: "100%", padding: 5, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
            </div>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Agreed Price (₹/MT)</label>
              <input type="number" value={agreedPricePerMt} onChange={(e) => setAgreedPricePerMt(e.target.value)} style={{ width: "100%", padding: 5, fontSize: 11.5, borderRadius: 4, border: "1px solid #94A3B8" }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 16px", fontSize: 12.5, borderRadius: 8, border: "1px solid var(--line)" }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: "8px 20px", fontSize: 12.5, fontWeight: 800, borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", cursor: "pointer" }}>
              💾 Save New Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
