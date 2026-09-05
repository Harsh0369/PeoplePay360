import React, { FormEvent, useMemo, useState } from "react";

/**
 * PeoplePay360 Authentication + User Access
 * -------------------------------------------------------
 * Drop-in React / Next.js client component.
 *
 * What this component covers:
 * - Employee/HR/Payroll/Admin sign-in UI
 * - Role-aware post-login shell
 * - Admin-only user management
 * - Create/Edit user panel
 * - Search + role filtering
 *Email: admin@company.com
Password: anything
 * IMPORTANT:
 * This component demonstrates the frontend authentication flow.
 * Real authentication and RBAC MUST also be enforced by your backend/API.
 */

export type PeoplePayRole =
  | "Employee"
  | "HR Manager"
  | "HR Payroll User"
  | "HR Payroll Manager"
  | "Admin";

export type UserStatus = "Active" | "Invited" | "Suspended";

export interface PeoplePayUser {
  id: string;
  name: string;
  employeeName: string;
  workEmail: string;
  role: PeoplePayRole;
  status: UserStatus;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PeoplePay360AuthProps {
  /**
   * Optional real login handler.
   * Return the authenticated user.
   * If omitted, the demo signs in as the matching mock user.
   */
  onLogin?: (payload: LoginPayload) => Promise<PeoplePayUser>;

  /**
   * Optional real save handler for user-management.
   * If omitted, users are saved only in local component state.
   */
  onSaveUser?: (user: PeoplePayUser) => Promise<void>;

  /**
   * Called after logout.
   */
  onLogout?: () => void;
}

const colors = {
  deepTeal: "#063F3B",
  darkTeal: "#0B5D57",
  teal: "#159A91",
  warmCream: "#F5F0E6",
  softSand: "#EAE2D5",
  offWhite: "#FFFDF8",
  darkCharcoal: "#1F2933",
  mutedSlate: "#667085",
  sageGreen: "#6FAF8B",
  coral: "#E98272",
  goldenAmber: "#D9A441",
  mutedLavender: "#8B7BB8",
  sandBorder: "#D8D0C3",

  // Soft Badge Colors
  activeBg: "#DCEFEB",
  activeText: "#0B5D57",
  leaveBg: "#F8EFD8",
  leaveText: "#9A6700",
  warningBg: "#FBE5E0",
  warningText: "#B5473A",
  draftBg: "#EAE2D5",
  draftText: "#667085",
  hoverRow: "#E2F0EC",
} as const;

const mockUsers: PeoplePayUser[] = [
  {
    id: "u-001",
    name: "Aarav Mehta",
    employeeName: "Aarav Mehta",
    workEmail: "aarav@company.com",
    role: "HR Payroll User",
    status: "Active",
  },
  {
    id: "u-002",
    name: "Maya Shah",
    employeeName: "Maya Shah",
    workEmail: "maya@company.com",
    role: "HR Manager",
    status: "Active",
  },
  {
    id: "u-003",
    name: "Rohan Patel",
    employeeName: "Rohan Patel",
    workEmail: "rohan@company.com",
    role: "Employee",
    status: "Active",
  },
  {
    id: "u-004",
    name: "Nisha Rao",
    employeeName: "Nisha Rao",
    workEmail: "nisha@company.com",
    role: "HR Payroll Manager",
    status: "Active",
  },
  {
    id: "u-005",
    name: "System Admin",
    employeeName: "System Admin",
    workEmail: "admin@company.com",
    role: "Admin",
    status: "Active",
  },
];

const roleDescriptions: Record<PeoplePayRole, string> = {
  Employee: "Own employee details, attendance and time-off access only.",
  "HR Manager":
    "Employee, attendance, contract, schedule and time-off administration. No payroll administration.",
  "HR Payroll User":
    "HR access plus operational Payrun and Payslip access; salary configuration is read-only.",
  "HR Payroll Manager":
    "Full HR and payroll access, including salary structures and salary rules.",
  Admin: "Full platform access including user management and role assignment.",
};

const roleAccent: Record<PeoplePayRole, string> = {
  Employee: colors.teal,
  "HR Manager": colors.sageGreen,
  "HR Payroll User": colors.goldenAmber,
  "HR Payroll Manager": colors.mutedLavender,
  Admin: colors.coral,
};

const canManageUsers = (role: PeoplePayRole) => role === "Admin";

const canSeePayroll = (role: PeoplePayRole) =>
  role === "HR Payroll User" ||
  role === "HR Payroll Manager" ||
  role === "Admin";

const modulesForRole = (role: PeoplePayRole) => {
  if (role === "Employee") return ["My Profile", "Attendance", "Time Off"];
  if (role === "HR Manager")
    return ["Employees", "Contracts", "Attendance", "Time Off", "Working Schedules"];
  if (role === "HR Payroll User")
    return [
      "Employees",
      "Contracts",
      "Attendance",
      "Time Off",
      "Payroll",
      "Reports",
    ];
  if (role === "HR Payroll Manager")
    return [
      "Employees",
      "Contracts",
      "Attendance",
      "Time Off",
      "Payroll",
      "Salary Structures",
      "Salary Rules",
      "Reports",
    ];
  return [
    "Employees",
    "Contracts",
    "Attendance",
    "Time Off",
    "Payroll",
    "Salary Structures",
    "Salary Rules",
    "Reports",
    "User Management",
  ];
};

function Icon({
  name,
  size = 18,
}: {
  name: "lock" | "user" | "search" | "plus" | "shield" | "eye" | "eyeOff";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths = {
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
        <path d="m9.5 12 1.8 1.8 3.5-3.8" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 6.2C11 6.1 11.5 6 12 6c6.5 0 10 6 10 6a17 17 0 0 1-2.2 2.8" />
        <path d="M6.6 6.6C3.6 8.3 2 12 2 12s3.5 6 10 6c1.6 0 3-.4 4.2-1" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

export default function PeoplePay360Auth({
  onLogin,
  onSaveUser,
  onLogout,
}: PeoplePay360AuthProps) {
  const [users, setUsers] = useState<PeoplePayUser[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<PeoplePayUser | null>(null);

  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("peoplepay360");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [view, setView] = useState<"workspace" | "users">("workspace");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<PeoplePayRole | "All">("All");
  const [editing, setEditing] = useState<PeoplePayUser | null>(null);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !normalized ||
        user.name.toLowerCase().includes(normalized) ||
        user.employeeName.toLowerCase().includes(normalized) ||
        user.workEmail.toLowerCase().includes(normalized);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, query, roleFilter]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setIsSigningIn(true);

    try {
      let authenticatedUser: PeoplePayUser;

      if (onLogin) {
        authenticatedUser = await onLogin({ email, password });
      } else {
        const found = users.find(
          (user) => user.workEmail.toLowerCase() === email.trim().toLowerCase()
        );

        if (!found) {
          throw new Error("No active PeoplePay360 account exists for that work email.");
        }

        if (found.status !== "Active") {
          throw new Error("This account is not active. Contact your administrator.");
        }

        authenticatedUser = found;
      }

      setCurrentUser(authenticatedUser);
      setView("workspace");
    } catch (error) {
      setLoginError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please verify your credentials."
      );
    } finally {
      setIsSigningIn(false);
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setView("workspace");
    setEditing(null);
    setLoginError("");
    onLogout?.();
  }

  function openNewUser() {
    setEditing({
      id: `u-${Date.now()}`,
      name: "",
      employeeName: "",
      workEmail: "",
      role: "Employee",
      status: "Active",
    });
    setSaveError("");
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    setSaveError("");

    if (!editing.employeeName.trim() || !editing.workEmail.trim()) {
      setSaveError("Employee and work email are required.");
      return;
    }

    const duplicateEmail = users.some(
      (user) =>
        user.id !== editing.id &&
        user.workEmail.toLowerCase() === editing.workEmail.trim().toLowerCase()
    );

    if (duplicateEmail) {
      setSaveError("A user account already exists for this work email.");
      return;
    }

    setIsSaving(true);

    try {
      const normalized: PeoplePayUser = {
        ...editing,
        name: editing.name.trim() || editing.employeeName.trim(),
        employeeName: editing.employeeName.trim(),
        workEmail: editing.workEmail.trim().toLowerCase(),
      };

      await onSaveUser?.(normalized);

      setUsers((previous) => {
        const exists = previous.some((user) => user.id === normalized.id);
        return exists
          ? previous.map((user) => (user.id === normalized.id ? normalized : user))
          : [normalized, ...previous];
      });

      setEditing(null);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to save user access."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!currentUser) {
    return (
      <div style={styles.page}>
        <div style={styles.loginLayout}>
          <section style={styles.brandPanel}>
            <div style={styles.brandMark}>P360</div>
            <p style={styles.brandEyebrow}>PEOPLEPAY360</p>
            <h1 style={styles.brandTitle}>
              HR & Payroll,
              <br />
              connected end to end.
            </h1>
            <p style={styles.brandCopy}>
              One secure workspace for employee records, attendance, time off,
              contracts and payroll operations.
            </p>

            <div style={styles.brandFeatureList}>
              {[
                "Role-aware access",
                "Employee-linked user accounts",
                "Payroll-sensitive permissions",
              ].map((item) => (
                <div key={item} style={styles.brandFeature}>
                  <span style={styles.brandFeatureDot}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={styles.brandFooter}>
              Built for trustworthy HR operations — not frontend-only security.
            </div>
          </section>

          <section style={styles.loginPanel}>
            <form onSubmit={handleLogin} style={styles.loginCard}>
              <div style={styles.iconBadge}>
                <Icon name="shield" size={22} />
              </div>
              <p style={styles.eyebrow}>SECURE ACCESS</p>
              <h2 style={styles.heading}>Welcome back</h2>
              <p style={styles.subheading}>
                Sign in with your work account to continue to PeoplePay360.
              </p>

              <label style={styles.label}>
                Work email
                <div style={styles.inputShell}>
                  <span style={styles.inputIcon}>
                    <Icon name="user" size={17} />
                  </span>
                  <input
                    style={styles.input}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label style={styles.label}>
                Password
                <div style={styles.inputShell}>
                  <span style={styles.inputIcon}>
                    <Icon name="lock" size={17} />
                  </span>
                  <input
                    style={styles.input}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((previous) => !previous)}
                    style={styles.iconButton}
                  >
                    <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
                  </button>
                </div>
              </label>

              <div style={styles.loginMeta}>
                <label style={styles.remember}>
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <button type="button" style={styles.linkButton}>
                  Forgot password?
                </button>
              </div>

              {loginError && <div style={styles.errorBox}>{loginError}</div>}

              <button
                type="submit"
                disabled={isSigningIn}
                style={{
                  ...styles.primaryButton,
                  opacity: isSigningIn ? 0.72 : 1,
                }}
              >
                {isSigningIn ? "Signing in…" : "Sign in"}
              </button>

              <div style={styles.demoNote}>
                <strong>Demo:</strong> use <code>admin@company.com</code> with any
                password to preview Admin user-management.
              </div>
            </form>
          </section>
        </div>
      </div>
    );
  }

  const modules = modulesForRole(currentUser.role);

  return (
    <div style={styles.appPage}>
      <header style={styles.topbar}>
        <div style={styles.topbarBrand}>
          <div style={styles.smallBrandMark}>P360</div>
          <div>
            <div style={styles.productName}>PeoplePay360</div>
            <div style={styles.productTag}>HR & Payroll Operations</div>
          </div>
        </div>

        <div style={styles.topbarActions}>
          <div
            style={{
              ...styles.roleChip,
              borderColor: roleAccent[currentUser.role],
              color: roleAccent[currentUser.role],
            }}
          >
            {currentUser.role}
          </div>
          <div style={styles.userMini}>
            <div style={styles.avatar}>
              {currentUser.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <div style={styles.userMiniName}>{currentUser.name}</div>
              <div style={styles.userMiniEmail}>{currentUser.workEmail}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.secondaryButton}>
            Sign out
          </button>
        </div>
      </header>

      <div style={styles.appShell}>
        <aside style={styles.sidebar}>
          <nav style={styles.nav}>
            {modules.map((module) => {
              const isUserManagement = module === "User Management";
              const active =
                (view === "users" && isUserManagement) ||
                (view === "workspace" && !isUserManagement && module === modules[0]);

              return (
                <button
                  key={module}
                  onClick={() => {
                    if (isUserManagement) setView("users");
                    else setView("workspace");
                  }}
                  style={{
                    ...styles.navItem,
                    ...(active ? styles.navItemActive : {}),
                  }}
                >
                  {module}
                </button>
              );
            })}
          </nav>

          <div style={styles.sidebarAccessCard}>
            <div style={styles.sidebarAccessTitle}>Access profile</div>
            <div style={styles.sidebarAccessRole}>{currentUser.role}</div>
            <div style={styles.sidebarAccessCopy}>
              {roleDescriptions[currentUser.role]}
            </div>
          </div>
        </aside>

        <main style={styles.content}>
          {view === "workspace" ? (
            <section>
              <div style={styles.pageHeaderRow}>
                <div>
                  <p style={styles.eyebrow}>AUTHENTICATED WORKSPACE</p>
                  <h1 style={styles.pageTitle}>Welcome, {currentUser.name}</h1>
                  <p style={styles.pageDescription}>
                    Your visible modules are based on your assigned PeoplePay360
                    role.
                  </p>
                </div>
              </div>

              <div style={styles.accessBanner}>
                <div style={styles.accessBannerIcon}>
                  <Icon name="shield" size={22} />
                </div>
                <div>
                  <div style={styles.accessBannerTitle}>
                    Role-based access is active
                  </div>
                  <div style={styles.accessBannerText}>
                    {roleDescriptions[currentUser.role]}
                  </div>
                </div>
              </div>

              <div style={styles.moduleGrid}>
                {modules
                  .filter((module) => module !== "User Management")
                  .map((module) => (
                    <button key={module} style={styles.moduleCard}>
                      <span style={styles.moduleDot} />
                      <span>
                        <strong style={styles.moduleTitle}>{module}</strong>
                        <span style={styles.moduleCopy}>
                          Open {module.toLowerCase()} workspace
                        </span>
                      </span>
                    </button>
                  ))}
              </div>

              {canSeePayroll(currentUser.role) && (
                <div style={styles.payrollHint}>
                  <span style={styles.payrollHintAccent}>Payroll access</span>
                  <span>
                    Your role includes payroll visibility. Final authorization must
                    still be checked by backend middleware / API permissions.
                  </span>
                </div>
              )}
            </section>
          ) : (
            <section>
              <div style={styles.pageHeaderRow}>
                <div>
                  <p style={styles.eyebrow}>ADMINISTRATION</p>
                  <h1 style={styles.pageTitle}>User Management</h1>
                  <p style={styles.pageDescription}>
                    Link accounts to employees, assign roles and control account
                    status.
                  </p>
                </div>

                <button
                  onClick={openNewUser}
                  disabled={!canManageUsers(currentUser.role)}
                  style={{
                    ...styles.primaryButton,
                    width: "auto",
                    padding: "12px 18px",
                    opacity: canManageUsers(currentUser.role) ? 1 : 0.55,
                  }}
                >
                  <span style={{ display: "inline-flex", marginRight: 8 }}>
                    <Icon name="plus" size={16} />
                  </span>
                  New user
                </button>
              </div>

              {!canManageUsers(currentUser.role) && (
                <div style={styles.errorBox}>
                  Only Admin users may create accounts or change role assignments.
                </div>
              )}

              <div style={styles.toolbar}>
                <div style={{ ...styles.inputShell, flex: 1 }}>
                  <span style={styles.inputIcon}>
                    <Icon name="search" size={17} />
                  </span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search users, employees or email…"
                    style={styles.input}
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(event.target.value as PeoplePayRole | "All")
                  }
                  style={styles.select}
                >
                  <option value="All">All roles</option>
                  <option value="Employee">Employee</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="HR Payroll User">HR Payroll User</option>
                  <option value="HR Payroll Manager">HR Payroll Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div style={styles.tableCard}>
                <div style={styles.tableScroll}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {["User", "Employee", "Work Email", "Role", "Status", ""].map(
                          (heading) => (
                            <th key={heading} style={styles.th}>
                              {heading}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} style={styles.tr}>
                          <td style={styles.tdStrong}>{user.name}</td>
                          <td style={styles.td}>{user.employeeName}</td>
                          <td style={styles.td}>{user.workEmail}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.roleBadge,
                                color: roleAccent[user.role],
                                borderColor: roleAccent[user.role],
                              }}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <StatusBadge status={user.status} />
                          </td>
                          <td style={styles.td}>
                            <button
                              type="button"
                              onClick={() => {
                                setSaveError("");
                                setEditing({ ...user });
                              }}
                              disabled={!canManageUsers(currentUser.role)}
                              style={styles.tableAction}
                            >
                              Edit access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={styles.managementNote}>
                <strong>Security note:</strong> user accounts should be linked to
                employee records, but authentication identity and employee master
                data should remain separate concepts. Role restrictions must be
                enforced by the backend, not only by hiding screens.
              </div>
            </section>
          )}
        </main>
      </div>

      {editing && canManageUsers(currentUser.role) && (
        <div
          style={styles.modalBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <form onSubmit={saveUser} style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <p style={styles.eyebrow}>ADMIN ONLY</p>
                <h2 style={styles.modalTitle}>
                  {users.some((user) => user.id === editing.id)
                    ? "Edit User Access"
                    : "Create User"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                style={styles.closeButton}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <label style={styles.label}>
              Employee *
              <input
                style={styles.plainInput}
                value={editing.employeeName}
                onChange={(event) =>
                  setEditing((previous) =>
                    previous
                      ? {
                          ...previous,
                          employeeName: event.target.value,
                          name: previous.name || event.target.value,
                        }
                      : previous
                  )
                }
                placeholder="Select or enter employee"
                required
              />
            </label>

            <label style={styles.label}>
              Work email *
              <input
                style={styles.plainInput}
                value={editing.workEmail}
                onChange={(event) =>
                  setEditing((previous) =>
                    previous
                      ? { ...previous, workEmail: event.target.value }
                      : previous
                  )
                }
                placeholder="employee@company.com"
                type="email"
                required
              />
            </label>

            <label style={styles.label}>
              Role *
              <select
                style={styles.plainInput}
                value={editing.role}
                onChange={(event) =>
                  setEditing((previous) =>
                    previous
                      ? {
                          ...previous,
                          role: event.target.value as PeoplePayRole,
                        }
                      : previous
                  )
                }
              >
                <option>Employee</option>
                <option>HR Manager</option>
                <option>HR Payroll User</option>
                <option>HR Payroll Manager</option>
                <option>Admin</option>
              </select>
            </label>

            <div style={styles.rolePreview}>
              <div
                style={{
                  ...styles.rolePreviewDot,
                  background: roleAccent[editing.role],
                }}
              />
              <div>
                <div style={styles.rolePreviewTitle}>{editing.role}</div>
                <div style={styles.rolePreviewCopy}>
                  {roleDescriptions[editing.role]}
                </div>
              </div>
            </div>

            <label style={styles.label}>
              Account status
              <select
                style={styles.plainInput}
                value={editing.status}
                onChange={(event) =>
                  setEditing((previous) =>
                    previous
                      ? {
                          ...previous,
                          status: event.target.value as UserStatus,
                        }
                      : previous
                  )
                }
              >
                <option>Active</option>
                <option>Invited</option>
                <option>Suspended</option>
              </select>
            </label>

            {saveError && <div style={styles.errorBox}>{saveError}</div>}

            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={() => setEditing(null)}
                style={styles.secondaryButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  ...styles.primaryButton,
                  width: "auto",
                  padding: "11px 18px",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? "Saving…" : "Save access"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const palette =
    status === "Active"
      ? { background: colors.activeBg, color: colors.activeText }
      : status === "Invited"
      ? { background: colors.leaveBg, color: colors.leaveText }
      : { background: colors.warningBg, color: colors.warningText };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        ...palette,
      }}
    >
      {status}
    </span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: colors.warmCream,
    color: colors.darkCharcoal,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  loginLayout: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "minmax(300px, 0.9fr) minmax(420px, 1.1fr)",
  },
  brandPanel: {
    position: "relative",
    overflow: "hidden",
    background: colors.deepTeal,
    color: colors.offWhite,
    padding: "72px clamp(36px, 6vw, 88px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  brandMark: {
    width: 54,
    height: 54,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    background: colors.teal,
    color: colors.offWhite,
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: 800,
    marginBottom: 28,
  },
  brandEyebrow: {
    margin: 0,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 2.2,
    color: colors.sageGreen,
  },
  brandTitle: {
    margin: "12px 0 18px",
    fontSize: "clamp(38px, 5vw, 68px)",
    lineHeight: 1.04,
    letterSpacing: "-0.045em",
    maxWidth: 660,
  },
  brandCopy: {
    margin: 0,
    maxWidth: 590,
    color: "#DDE9E5",
    fontSize: 17,
    lineHeight: 1.7,
  },
  brandFeatureList: {
    display: "grid",
    gap: 12,
    marginTop: 34,
  },
  brandFeature: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
    color: colors.softSand,
  },
  brandFeatureDot: {
    width: 28,
    height: 28,
    display: "grid",
    placeItems: "center",
    borderRadius: 10,
    background: "rgba(111,175,139,0.18)",
    color: "#B8DFC8",
    fontWeight: 800,
  },
  brandFooter: {
    marginTop: 54,
    paddingTop: 20,
    borderTop: "1px solid rgba(245,240,230,0.14)",
    color: "#AAC5C0",
    fontSize: 12,
    lineHeight: 1.6,
  },
  loginPanel: {
    display: "grid",
    placeItems: "center",
    padding: "48px 24px",
    background: colors.offWhite,
  },
  loginCard: {
    width: "min(460px, 100%)",
    background: colors.offWhite,
    border: `1px solid ${colors.sandBorder}`,
    borderRadius: 24,
    padding: "36px",
    boxShadow: "0 18px 50px rgba(31,41,51,0.08)",
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: colors.activeBg,
    color: colors.darkTeal,
    marginBottom: 18,
  },
  eyebrow: {
    margin: 0,
    color: colors.teal,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.6,
  },
  heading: {
    margin: "8px 0 8px",
    fontSize: 34,
    letterSpacing: "-0.035em",
    color: colors.darkCharcoal,
  },
  subheading: {
    margin: "0 0 28px",
    color: colors.mutedSlate,
    lineHeight: 1.65,
    fontSize: 14,
  },
  label: {
    display: "grid",
    gap: 8,
    marginBottom: 18,
    fontSize: 13,
    fontWeight: 700,
    color: colors.darkCharcoal,
  },
  inputShell: {
    minHeight: 48,
    display: "flex",
    alignItems: "center",
    border: `1px solid ${colors.sandBorder}`,
    borderRadius: 12,
    background: colors.offWhite,
    overflow: "hidden",
  },
  inputIcon: {
    display: "inline-flex",
    color: colors.mutedSlate,
    marginLeft: 14,
  },
  input: {
    width: "100%",
    border: 0,
    outline: "none",
    background: "transparent",
    color: colors.darkCharcoal,
    fontSize: 14,
    padding: "13px 14px",
  },
  iconButton: {
    border: 0,
    background: "transparent",
    color: colors.mutedSlate,
    cursor: "pointer",
    padding: "10px 14px",
    display: "grid",
    placeItems: "center",
  },
  loginMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: -2,
    marginBottom: 20,
    fontSize: 12,
  },
  remember: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: colors.mutedSlate,
  },
  linkButton: {
    border: 0,
    background: "transparent",
    padding: 0,
    color: colors.darkTeal,
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryButton: {
    width: "100%",
    minHeight: 48,
    border: 0,
    borderRadius: 12,
    background: colors.darkTeal,
    color: colors.offWhite,
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    minHeight: 40,
    border: `1px solid ${colors.sandBorder}`,
    borderRadius: 10,
    background: colors.offWhite,
    color: colors.darkCharcoal,
    fontSize: 13,
    fontWeight: 700,
    padding: "0 14px",
    cursor: "pointer",
  },
  demoNote: {
    marginTop: 18,
    padding: "12px 14px",
    borderRadius: 12,
    background: colors.softSand,
    color: colors.mutedSlate,
    fontSize: 12,
    lineHeight: 1.6,
  },
  errorBox: {
    marginBottom: 16,
    borderRadius: 12,
    padding: "12px 14px",
    background: colors.warningBg,
    color: colors.warningText,
    fontSize: 13,
    lineHeight: 1.5,
    border: "1px solid rgba(181,71,58,0.12)",
  },
  appPage: {
    minHeight: "100vh",
    background: colors.warmCream,
    color: colors.darkCharcoal,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  topbar: {
    height: 74,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    padding: "0 28px",
    background: colors.offWhite,
    borderBottom: `1px solid ${colors.sandBorder}`,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  topbarBrand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  smallBrandMark: {
    width: 38,
    height: 38,
    borderRadius: 11,
    background: colors.deepTeal,
    color: colors.offWhite,
    display: "grid",
    placeItems: "center",
    fontSize: 10,
    fontWeight: 900,
  },
  productName: {
    fontWeight: 850,
    letterSpacing: "-0.02em",
    fontSize: 15,
  },
  productTag: {
    color: colors.mutedSlate,
    fontSize: 11,
    marginTop: 1,
  },
  topbarActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  roleChip: {
    border: "1px solid",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 800,
    background: colors.offWhite,
  },
  userMini: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    background: colors.activeBg,
    color: colors.darkTeal,
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 900,
  },
  userMiniName: {
    fontSize: 12,
    fontWeight: 800,
  },
  userMiniEmail: {
    fontSize: 10,
    color: colors.mutedSlate,
  },
  appShell: {
    display: "grid",
    gridTemplateColumns: "250px minmax(0,1fr)",
    minHeight: "calc(100vh - 74px)",
  },
  sidebar: {
    background: colors.offWhite,
    borderRight: `1px solid ${colors.sandBorder}`,
    padding: "20px 14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  nav: {
    display: "grid",
    gap: 4,
  },
  navItem: {
    textAlign: "left",
    border: 0,
    borderRadius: 10,
    padding: "11px 12px",
    background: "transparent",
    color: colors.mutedSlate,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
  },
  navItemActive: {
    background: colors.activeBg,
    color: colors.darkTeal,
  },
  sidebarAccessCard: {
    marginTop: 24,
    borderRadius: 14,
    background: colors.softSand,
    padding: 14,
  },
  sidebarAccessTitle: {
    fontSize: 10,
    fontWeight: 800,
    color: colors.mutedSlate,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sidebarAccessRole: {
    fontSize: 13,
    fontWeight: 850,
    color: colors.deepTeal,
    marginTop: 6,
  },
  sidebarAccessCopy: {
    color: colors.mutedSlate,
    lineHeight: 1.5,
    fontSize: 11,
    marginTop: 6,
  },
  content: {
    padding: "34px clamp(24px,4vw,54px)",
    minWidth: 0,
  },
  pageHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
    marginBottom: 24,
  },
  pageTitle: {
    margin: "7px 0 5px",
    fontSize: 32,
    letterSpacing: "-0.035em",
  },
  pageDescription: {
    color: colors.mutedSlate,
    margin: 0,
    lineHeight: 1.6,
    fontSize: 14,
  },
  accessBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    background: colors.offWhite,
    border: `1px solid ${colors.sandBorder}`,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  accessBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: colors.activeBg,
    color: colors.darkTeal,
    flex: "0 0 auto",
  },
  accessBannerTitle: {
    fontWeight: 850,
    fontSize: 14,
  },
  accessBannerText: {
    color: colors.mutedSlate,
    fontSize: 12,
    lineHeight: 1.55,
    marginTop: 4,
  },
  moduleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 14,
  },
  moduleCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 13,
    textAlign: "left",
    background: colors.offWhite,
    border: `1px solid ${colors.sandBorder}`,
    borderRadius: 16,
    padding: 18,
    cursor: "pointer",
    color: colors.darkCharcoal,
  },
  moduleDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: colors.teal,
    marginTop: 4,
    flex: "0 0 auto",
  },
  moduleTitle: {
    display: "block",
    fontSize: 14,
    marginBottom: 4,
  },
  moduleCopy: {
    display: "block",
    color: colors.mutedSlate,
    fontSize: 11,
  },
  payrollHint: {
    marginTop: 22,
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: 12,
    background: colors.leaveBg,
    color: colors.leaveText,
    fontSize: 12,
  },
  payrollHintAccent: {
    fontWeight: 850,
    whiteSpace: "nowrap",
  },
  toolbar: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
  },
  select: {
    minWidth: 190,
    border: `1px solid ${colors.sandBorder}`,
    borderRadius: 12,
    background: colors.offWhite,
    color: colors.darkCharcoal,
    padding: "0 12px",
    outline: "none",
  },
  tableCard: {
    background: colors.offWhite,
    border: `1px solid ${colors.sandBorder}`,
    borderRadius: 16,
    overflow: "hidden",
  },
  tableScroll: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 900,
  },
  th: {
    textAlign: "left",
    padding: "13px 16px",
    background: colors.softSand,
    color: colors.mutedSlate,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    borderBottom: `1px solid ${colors.sandBorder}`,
  },
  tr: {
    borderBottom: `1px solid ${colors.sandBorder}`,
  },
  td: {
    padding: "15px 16px",
    fontSize: 12,
    color: colors.mutedSlate,
    verticalAlign: "middle",
  },
  tdStrong: {
    padding: "15px 16px",
    fontSize: 12,
    fontWeight: 800,
    color: colors.darkCharcoal,
    verticalAlign: "middle",
  },
  roleBadge: {
    display: "inline-flex",
    padding: "5px 9px",
    borderRadius: 999,
    border: "1px solid",
    fontSize: 10,
    fontWeight: 800,
    background: colors.offWhite,
  },
  tableAction: {
    border: 0,
    background: "transparent",
    color: colors.darkTeal,
    fontWeight: 800,
    fontSize: 11,
    cursor: "pointer",
  },
  managementNote: {
    marginTop: 16,
    padding: "14px 16px",
    borderRadius: 12,
    background: colors.activeBg,
    color: colors.activeText,
    lineHeight: 1.55,
    fontSize: 12,
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    background: "rgba(6,63,59,0.32)",
    display: "grid",
    placeItems: "center",
    padding: 20,
  },
  modal: {
    width: "min(520px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: colors.offWhite,
    border: `1px solid ${colors.sandBorder}`,
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 24px 70px rgba(31,41,51,0.22)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 20,
  },
  modalTitle: {
    margin: "6px 0 0",
    fontSize: 24,
    letterSpacing: "-0.03em",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: `1px solid ${colors.sandBorder}`,
    background: colors.offWhite,
    color: colors.mutedSlate,
    cursor: "pointer",
    fontSize: 22,
    lineHeight: 1,
  },
  plainInput: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 46,
    border: `1px solid ${colors.sandBorder}`,
    borderRadius: 11,
    background: colors.offWhite,
    color: colors.darkCharcoal,
    padding: "0 12px",
    outline: "none",
    fontSize: 13,
  },
  rolePreview: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: 14,
    margin: "-4px 0 18px",
    borderRadius: 12,
    background: colors.softSand,
  },
  rolePreviewDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 4,
    flex: "0 0 auto",
  },
  rolePreviewTitle: {
    fontSize: 12,
    fontWeight: 850,
  },
  rolePreviewCopy: {
    color: colors.mutedSlate,
    lineHeight: 1.5,
    fontSize: 11,
    marginTop: 3,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
  },
};
