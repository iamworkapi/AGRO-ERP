import { useRef } from "react";
import Avatar from "./Avatar";
import Button from "./Button";
import { toast } from "../../utils/toast";

// Small profile-photo upload control: reads the chosen image as a base64
// data URI client-side (no object storage / upload endpoint needed) and
// hands that string back via onChange. Used anywhere a person record wants
// a "snap" - Employees and Users (Admin/Supervisor accounts) both use this
// same component so the upload UX and size/type limits never drift apart.
const MAX_PHOTO_BYTES = 500 * 1024; // 500KB - matches the backend's ~700k-char base64 cap

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoPicker({ value, onChange, name, label = "Photo" }) {
  const inputRef = useRef(null);
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Photo is too large - please use an image under 500KB.");
      return;
    }
    onChange(await readFileAsDataUrl(file));
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      {value ? (
        <img src={value} alt={name || "Photo"} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
      ) : (
        <Avatar initials={initials} index={0} />
      )}
      <div>
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} style={{ padding: "5px 12px", fontSize: 12 }}>
          {value ? `Change ${label}` : `Upload ${label}`}
        </Button>
        {value && (
          <button type="button" onClick={() => onChange("")} style={{ marginLeft: 8, border: "none", background: "transparent", color: "var(--status-error)", fontSize: 12, cursor: "pointer" }}>
            Remove
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      </div>
    </div>
  );
}
