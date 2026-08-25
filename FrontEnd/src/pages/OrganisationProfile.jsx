import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import Card from "../components/common/Card";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import AsyncState from "../components/common/AsyncState";
import { useSettings } from "../features/settings/useSettings";

export default function OrganisationProfile() {
  const { orgProfile, status, error, updateOrgProfile } = useSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (orgProfile && !form) setForm(orgProfile);
  }, [orgProfile, form]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await updateOrgProfile(form);
    setSaving(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Organisation Profile"
        subtitle="Manage your organisation's identity, active procurement centres, and subscription tier"
      />

      <AsyncState status={status} error={error} loadingLabel="Loading organisation profile…" />

      {form && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }} className="responsive-grid-2">
          {/* Main Edit Form Card */}
          <Card title="Organisation Profile & Billing Details" icon="fa-solid fa-building-columns">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FormField
                label="Organisation Name"
                icon="fa-solid fa-building"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="e.g. AgroPR ERP Group"
                compact
                marginBottom={10}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <FormField
                  label="Active Procurement Centres"
                  type="number"
                  icon="fa-solid fa-warehouse"
                  value={form.centres}
                  onChange={(v) => setForm({ ...form, centres: v })}
                  compact
                  marginBottom={10}
                />

                <FormField
                  label="Subscription Plan Tier"
                  icon="fa-solid fa-crown"
                  value={form.plan}
                  onChange={(v) => setForm({ ...form, plan: v })}
                  compact
                  marginBottom={10}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                <Button
                  type="submit"
                  disabled={saving}
                  className="btn-glow"
                  style={{
                    padding: "8px 18px",
                    fontSize: 12.5,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--gradient-primary)",
                  }}
                >
                  {saving ? (
                    <>
                      <i className="fa-solid fa-circle-notch spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check" /> Save Profile Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Plan & License Summary Card */}
          <Card title="Plan & Enterprise Status" icon="fa-solid fa-shield-halved">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "var(--primary-tint)", border: "1px solid rgba(0,184,107,0.2)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Current License</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--primary-deep)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <i className="fa-solid fa-crown" style={{ color: "#D97706" }} /> {form.plan || "Enterprise Plan"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                  <i className="fa-solid fa-warehouse" style={{ fontSize: 11 }} /> Active Hubs:
                </span>
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>{form.centres} Hubs</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                  <i className="fa-solid fa-circle-check" style={{ fontSize: 11 }} /> System SLA Status:
                </span>
                <Badge tone="success">99.9% UPTIME</Badge>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                  <i className="fa-solid fa-lock" style={{ fontSize: 11 }} /> Encryption Protocol:
                </span>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>AES-256 Bit</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
