// src/pages/Settings_new.jsx
import React, { useState, useEffect } from "react";

// node_modules/lucide-react/dist/esm/createLucideIcon.js
import { forwardRef as forwardRef2, createElement as createElement2 } from "react";

// node_modules/lucide-react/dist/esm/shared/src/utils.js
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
var toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
var hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
};

// node_modules/lucide-react/dist/esm/Icon.js
import { forwardRef, createElement } from "react";

// node_modules/lucide-react/dist/esm/defaultAttributes.js
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

// node_modules/lucide-react/dist/esm/Icon.js
var Icon = forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => createElement(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);

// node_modules/lucide-react/dist/esm/createLucideIcon.js
var createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef2(
    ({ className, ...props }, ref) => createElement2(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};

// node_modules/lucide-react/dist/esm/icons/bell.js
var __iconNode = [
  ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
  [
    "path",
    {
      d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
      key: "11g9vi"
    }
  ]
];
var Bell = createLucideIcon("bell", __iconNode);

// node_modules/lucide-react/dist/esm/icons/clock.js
var __iconNode2 = [
  ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
];
var Clock = createLucideIcon("clock", __iconNode2);

// node_modules/lucide-react/dist/esm/icons/map.js
var __iconNode3 = [
  [
    "path",
    {
      d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
      key: "169xi5"
    }
  ],
  ["path", { d: "M15 5.764v15", key: "1pn4in" }],
  ["path", { d: "M9 3.236v15", key: "1uimfh" }]
];
var Map = createLucideIcon("map", __iconNode3);

// node_modules/lucide-react/dist/esm/icons/moon.js
var __iconNode4 = [
  [
    "path",
    {
      d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
      key: "kfwtm"
    }
  ]
];
var Moon = createLucideIcon("moon", __iconNode4);

// node_modules/lucide-react/dist/esm/icons/pen.js
var __iconNode5 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
];
var Pen = createLucideIcon("pen", __iconNode5);

// node_modules/lucide-react/dist/esm/icons/plus.js
var __iconNode6 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
var Plus = createLucideIcon("plus", __iconNode6);

// node_modules/lucide-react/dist/esm/icons/settings.js
var __iconNode7 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
var Settings = createLucideIcon("settings", __iconNode7);

// node_modules/lucide-react/dist/esm/icons/shield.js
var __iconNode8 = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ]
];
var Shield = createLucideIcon("shield", __iconNode8);

// node_modules/lucide-react/dist/esm/icons/trash-2.js
var __iconNode9 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
var Trash2 = createLucideIcon("trash-2", __iconNode9);

// node_modules/lucide-react/dist/esm/icons/user.js
var __iconNode10 = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
var User = createLucideIcon("user", __iconNode10);

// node_modules/lucide-react/dist/esm/icons/users.js
var __iconNode11 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
var Users = createLucideIcon("users", __iconNode11);

// src/pages/Settings_new.jsx
function Settings2() {
  const [activeTab, setActiveTab] = useState("general");
  const settingsTabs = [
    { id: "general", label: "General", icon: /* @__PURE__ */ React.createElement(Settings, { size: 16 }) },
    { id: "overspeed", label: "Overspeed Control", icon: /* @__PURE__ */ React.createElement(Clock, { size: 16 }) },
    { id: "nightmove", label: "Night Move", icon: /* @__PURE__ */ React.createElement(Moon, { size: 16 }) },
    { id: "units", label: "Unit Management", icon: /* @__PURE__ */ React.createElement(Users, { size: 16 }) },
    { id: "vehicles", label: "Vehicle Management", icon: /* @__PURE__ */ React.createElement(Map, { size: 16 }) },
    { id: "profiles", label: "Profile Management", icon: /* @__PURE__ */ React.createElement(User, { size: 16 }) },
    { id: "notifications", label: "Notifications", icon: /* @__PURE__ */ React.createElement(Bell, { size: 16 }) },
    { id: "security", label: "Security", icon: /* @__PURE__ */ React.createElement(Shield, { size: 16 }) }
  ];
  const [units, setUnits] = useState([]);
  const [vehicles, setVehicles] = useState([
    { id: 1, baNumber: "34-A-1234", type: "Jeep", unit: "", status: "Active" },
    { id: 2, baNumber: "34-A-5678", type: "5 Ton", unit: "", status: "Active" },
    { id: 3, baNumber: "34-A-9012", type: "Jeep", unit: "", status: "Maintenance" }
  ]);
  const [overspeedLimits, setOverspeedLimits] = useState({
    first: 60,
    second: 80
  });
  useEffect(() => {
    const savedLimits = localStorage.getItem("overspeedLimits");
    if (savedLimits) {
      try {
        setOverspeedLimits(JSON.parse(savedLimits));
      } catch (error) {
        console.error("Error loading overspeed limits:", error);
      }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("overspeedLimits", JSON.stringify(overspeedLimits));
  }, [overspeedLimits]);
  const [nightMoveSettings, setNightMoveSettings] = useState({
    startTime: "20:00",
    // 8 PM
    endTime: "06:00",
    // 6 AM
    enabled: true,
    alertOnViolation: true,
    gracePeriod: 15,
    // minutes
    allowedUnits: [],
    // Which units are allowed night moves
    weekendRules: {
      enabled: false,
      startTime: "22:00",
      endTime: "05:00"
    }
  });
  const [smsSettings, setSmsSettings] = useState({
    enabled: true,
    emergencyContact: "",
    unitCommanders: true,
    systemAdmin: true,
    violationTypes: {
      panic: true,
      overspeed: true,
      unsanctioned: true
    }
  });
  const [newUnit, setNewUnit] = useState({ name: "", commander: "", contact: "" });
  const [newVehicle, setNewVehicle] = useState({ baNumber: "", type: "Jeep", unit: "", status: "Active" });
  const [profiles, setProfiles] = useState([]);
  const [newProfile, setNewProfile] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    role: "user",
    unit_id: "",
    contact_number: ""
  });
  const [editingProfile, setEditingProfile] = useState(null);
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/units_full");
        const unitsData = await response.json();
        const transformedUnits = unitsData.map((unit) => ({
          id: unit.unit_id,
          name: unit.unit_name,
          commander: `Commander ${unit.unit_name}`,
          // Mock commander name
          contact: `0300-${Math.floor(Math.random() * 1e7).toString().padStart(7, "0")}`
          // Mock contact
        }));
        setUnits(transformedUnits);
        if (transformedUnits.length > 0) {
          setVehicles((prev) => prev.map((v) => ({ ...v, unit: transformedUnits[0].name })));
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        setUnits([
          { id: 1, name: "340", commander: "Col. ", contact: "0300-1234567" },
          { id: 2, name: "341", commander: "Col. ", contact: "0300-9876543" },
          { id: 3, name: "342", commander: "Col. ", contact: "0300-4567890" },
          { id: 4, name: "Div Arty", commander: "", contact: "0300-3456789" },
          { id: 5, name: "HQ 34 Div", commander: "Col. ", contact: "0300-2345678" }
        ]);
      }
    };
    fetchUnits();
  }, []);
  const handleAddUnit = () => {
    if (newUnit.name && newUnit.commander && newUnit.contact) {
      setUnits([...units, { ...newUnit, id: units.length + 1 }]);
      setNewUnit({ name: "", commander: "", contact: "" });
    }
  };
  const handleDeleteUnit = (id) => {
    setUnits(units.filter((unit) => unit.id !== id));
  };
  const handleAddVehicle = () => {
    if (newVehicle.baNumber && newVehicle.type && newVehicle.unit) {
      setVehicles([...vehicles, { ...newVehicle, id: vehicles.length + 1 }]);
      setNewVehicle({ baNumber: "", type: "Jeep", unit: "", status: "Active" });
    }
  };
  const handleDeleteVehicle = (id) => {
    setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
  };
  const handleAddProfile = async () => {
    if (newProfile.username && newProfile.password && newProfile.role) {
      try {
        const response = await fetch("http://localhost:5000/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProfile)
        });
        if (response.ok) {
          const createdProfile = await response.json();
          setProfiles([...profiles, createdProfile]);
          setNewProfile({
            username: "",
            password: "",
            full_name: "",
            email: "",
            role: "user",
            unit_id: "",
            contact_number: ""
          });
        } else {
          const profile = {
            id: profiles.length + 1,
            ...newProfile,
            is_active: true,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          setProfiles([...profiles, profile]);
          setNewProfile({
            username: "",
            password: "",
            full_name: "",
            email: "",
            role: "user",
            unit_id: "",
            contact_number: ""
          });
        }
      } catch (error) {
        console.error("Error adding profile:", error);
        const profile = {
          id: profiles.length + 1,
          ...newProfile,
          is_active: true,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        setProfiles([...profiles, profile]);
        setNewProfile({
          username: "",
          password: "",
          full_name: "",
          email: "",
          role: "user",
          unit_id: "",
          contact_number: ""
        });
      }
    }
  };
  const handleUpdateProfile = async () => {
    if (editingProfile) {
      try {
        const response = await fetch(`http://localhost:5000/api/profiles/${editingProfile.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingProfile)
        });
        if (response.ok) {
          const updatedProfile = await response.json();
          setProfiles(profiles.map((p) => p.id === updatedProfile.id ? updatedProfile : p));
        } else {
          setProfiles(profiles.map((p) => p.id === editingProfile.id ? editingProfile : p));
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        setProfiles(profiles.map((p) => p.id === editingProfile.id ? editingProfile : p));
      }
      setEditingProfile(null);
    }
  };
  const handleDeleteProfile = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/profiles/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setProfiles(profiles.filter((p) => p.id !== id));
      } else {
        setProfiles(profiles.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      setProfiles(profiles.filter((p) => p.id !== id));
    }
  };
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/profiles");
        if (response.ok) {
          const profilesData = await response.json();
          setProfiles(profilesData);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };
    fetchProfiles();
  }, []);
  const calculateNightDuration = (startTime, endTime) => {
    const start = /* @__PURE__ */ new Date(`2000-01-01T${startTime}`);
    const end = /* @__PURE__ */ new Date(`2000-01-01T${endTime}`);
    let duration;
    if (end > start) {
      duration = (end - start) / (1e3 * 60 * 60);
    } else {
      const nextDay = /* @__PURE__ */ new Date(`2000-01-02T${endTime}`);
      duration = (nextDay - start) / (1e3 * 60 * 60);
    }
    return duration.toFixed(1);
  };
  const handleSaveOverspeedSettings = () => {
    alert("Overspeed settings saved successfully!");
  };
  return /* @__PURE__ */ React.createElement("div", { className: "container-fluid py-4" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex justify-content-between align-items-center mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "fw-bold mb-1 text-dark" }, "Settings"), /* @__PURE__ */ React.createElement("p", { className: "text-muted small mb-0" }, "Configure system preferences and manage your VMS settings"))), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-3" }, /* @__PURE__ */ React.createElement("div", { className: "card border-0 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "card-body p-0" }, settingsTabs.map((tab) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: tab.id,
      onClick: () => setActiveTab(tab.id),
      className: `w-100 text-start px-4 py-3 border-0 bg-transparent d-flex align-items-center gap-3 transition-all ${activeTab === tab.id ? "bg-primary text-white border-start border-4 border-primary" : "text-muted hover-bg-light"}`,
      style: {
        backgroundColor: activeTab === tab.id ? "rgba(13, 110, 253, 0.1)" : "transparent",
        color: activeTab === tab.id ? "#0d6efd" : "#6c757d"
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: { color: activeTab === tab.id ? "white" : "#6c757d" } }, tab.icon),
    /* @__PURE__ */ React.createElement("span", { className: "fw-medium" }, tab.label)
  ))))), /* @__PURE__ */ React.createElement("div", { className: "col-md-9" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-2 p-5 border-0 shadow-sm bg-white", style: {
    minHeight: "600px"
  } }, activeTab === "general" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "mb-4" }, "General Settings"), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "System Name"), /* @__PURE__ */ React.createElement("input", { type: "text", className: "form-control", defaultValue: "Vehicle Management System" })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Division Name"), /* @__PURE__ */ React.createElement("input", { type: "text", className: "form-control", defaultValue: "34 Division" })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Time Zone"), /* @__PURE__ */ React.createElement("select", { className: "form-select" }, /* @__PURE__ */ React.createElement("option", null, "UTC+05:00 Pakistan Standard Time"), /* @__PURE__ */ React.createElement("option", null, "UTC+00:00 Greenwich Mean Time"), /* @__PURE__ */ React.createElement("option", null, "UTC-05:00 Eastern Standard Time"))), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Language"), /* @__PURE__ */ React.createElement("select", { className: "form-select" }, /* @__PURE__ */ React.createElement("option", null, "English"), /* @__PURE__ */ React.createElement("option", null, "Urdu")))), activeTab === "overspeed" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "mb-4" }, "Overspeed Control Settings"), /* @__PURE__ */ React.createElement("div", { className: "alert alert-info mb-4", role: "alert" }, /* @__PURE__ */ React.createElement("div", { className: "d-flex align-items-center mb-2" }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "20px",
    height: "20px",
    backgroundColor: "#fbbf24",
    borderRadius: "4px",
    marginRight: "10px"
  } }), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "First Limit:"), " Vehicle BA number and speed turn yellow")), /* @__PURE__ */ React.createElement("div", { className: "d-flex align-items-center" }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "20px",
    height: "20px",
    backgroundColor: "#ef4444",
    borderRadius: "4px",
    marginRight: "10px"
  } }), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "Second Limit:"), " Vehicle BA number and speed turn red"))), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-6 mb-4" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "First Overspeed Limit (km/h)"), /* @__PURE__ */ React.createElement("div", { className: "input-group" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "form-control",
      value: overspeedLimits.first,
      onChange: (e) => setOverspeedLimits({ ...overspeedLimits, first: parseInt(e.target.value) }),
      style: { borderColor: "rgba(251, 191, 36, 0.3)" }
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "input-group-text", style: { backgroundColor: "#fef3c7", borderColor: "rgba(251, 191, 36, 0.3)" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "16px", height: "16px", backgroundColor: "#fbbf24", borderRadius: "2px" } }))), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Vehicles exceeding this speed will show yellow BA number and speed")), /* @__PURE__ */ React.createElement("div", { className: "col-md-6 mb-4" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Second Overspeed Limit (km/h)"), /* @__PURE__ */ React.createElement("div", { className: "input-group" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "form-control",
      value: overspeedLimits.second,
      onChange: (e) => setOverspeedLimits({ ...overspeedLimits, second: parseInt(e.target.value) }),
      style: { borderColor: "rgba(239, 68, 68, 0.3)" }
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "input-group-text", style: { backgroundColor: "#fee2e2", borderColor: "rgba(239, 68, 68, 0.3)" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "16px", height: "16px", backgroundColor: "#ef4444", borderRadius: "2px" } }))), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Vehicles exceeding this speed will show red BA number and speed with warning"))), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement("input", { className: "form-check-input", type: "checkbox", defaultChecked: true }), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Enable Overspeed Alerts"))), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement("input", { className: "form-check-input", type: "checkbox", defaultChecked: true }), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Auto-report Violations")))), activeTab === "nightmove" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "mb-4" }, "Night Move Time Settings"), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-6 mb-4" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Night Start Time"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "time",
      className: "form-control",
      value: nightMoveSettings.startTime,
      onChange: (e) => setNightMoveSettings({ ...nightMoveSettings, startTime: e.target.value })
    }
  ), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Time when night move restrictions begin")), /* @__PURE__ */ React.createElement("div", { className: "col-md-6 mb-4" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Night End Time"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "time",
      className: "form-control",
      value: nightMoveSettings.endTime,
      onChange: (e) => setNightMoveSettings({ ...nightMoveSettings, endTime: e.target.value })
    }
  ), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Time when night move restrictions end"))), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-6 mb-4" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Grace Period (minutes)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "form-control",
      value: nightMoveSettings.gracePeriod,
      onChange: (e) => setNightMoveSettings({ ...nightMoveSettings, gracePeriod: parseInt(e.target.value) })
    }
  ), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Allowed delay before violation is recorded")), /* @__PURE__ */ React.createElement("div", { className: "col-md-6 mb-4" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Current Time Period"), /* @__PURE__ */ React.createElement("div", { className: "form-control-plaintext" }, /* @__PURE__ */ React.createElement("strong", null, "Night Period:"), " ", nightMoveSettings.startTime, " - ", nightMoveSettings.endTime, /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("strong", null, "Duration:"), " ", calculateNightDuration(nightMoveSettings.startTime, nightMoveSettings.endTime), " hours"))), /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-check-input",
      type: "checkbox",
      checked: nightMoveSettings.enabled,
      onChange: (e) => setNightMoveSettings({ ...nightMoveSettings, enabled: e.target.checked })
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Enable Night Move Monitoring"))), /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-check-input",
      type: "checkbox",
      checked: nightMoveSettings.alertOnViolation,
      onChange: (e) => setNightMoveSettings({ ...nightMoveSettings, alertOnViolation: e.target.checked })
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Alert on Night Move Violations"))), /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("h6", { className: "mb-0" }, "Weekend Rules")), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-check-input",
      type: "checkbox",
      checked: nightMoveSettings.weekendRules.enabled,
      onChange: (e) => setNightMoveSettings({
        ...nightMoveSettings,
        weekendRules: { ...nightMoveSettings.weekendRules, enabled: e.target.checked }
      })
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Enable Different Weekend Times"))), nightMoveSettings.weekendRules.enabled && /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Weekend Start Time"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "time",
      className: "form-control",
      value: nightMoveSettings.weekendRules.startTime,
      onChange: (e) => setNightMoveSettings({
        ...nightMoveSettings,
        weekendRules: { ...nightMoveSettings.weekendRules, startTime: e.target.value }
      })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-6" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Weekend End Time"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "time",
      className: "form-control",
      value: nightMoveSettings.weekendRules.endTime,
      onChange: (e) => setNightMoveSettings({
        ...nightMoveSettings,
        weekendRules: { ...nightMoveSettings.weekendRules, endTime: e.target.value }
      })
    }
  ))))), /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("h6", { className: "mb-0" }, "Units Allowed for Night Moves")), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, units.map((unit) => /* @__PURE__ */ React.createElement("div", { key: unit.id, className: "col-md-4 mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "form-check" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-check-input",
      type: "checkbox",
      id: `unit-${unit.id}`,
      checked: nightMoveSettings.allowedUnits.includes(unit.name),
      onChange: (e) => {
        if (e.target.checked) {
          setNightMoveSettings({
            ...nightMoveSettings,
            allowedUnits: [...nightMoveSettings.allowedUnits, unit.name]
          });
        } else {
          setNightMoveSettings({
            ...nightMoveSettings,
            allowedUnits: nightMoveSettings.allowedUnits.filter((u) => u !== unit.name)
          });
        }
      }
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "form-check-label", htmlFor: `unit-${unit.id}` }, unit.name))))), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Select units that are permitted to move during night hours")))), activeTab === "units" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "mb-4" }, "Unit Management"), /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("h6", { className: "mb-0" }, "Add New Unit")), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-4" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Unit Name",
      value: newUnit.name,
      onChange: (e) => setNewUnit({ ...newUnit, name: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-4" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Commander",
      value: newUnit.commander,
      onChange: (e) => setNewUnit({ ...newUnit, commander: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-4" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Contact",
      value: newUnit.contact,
      onChange: (e) => setNewUnit({ ...newUnit, contact: e.target.value })
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "row mt-3" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-12" }, /* @__PURE__ */ React.createElement("button", { onClick: handleAddUnit, className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(Plus, { size: 16, className: "me-1" }), " Add Unit"))))), /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "table table-bordered" }, /* @__PURE__ */ React.createElement("thead", { className: "table-light" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Unit Name"), /* @__PURE__ */ React.createElement("th", null, "Commander"), /* @__PURE__ */ React.createElement("th", null, "Contact"), /* @__PURE__ */ React.createElement("th", null, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, units.map((unit) => /* @__PURE__ */ React.createElement("tr", { key: unit.id }, /* @__PURE__ */ React.createElement("td", null, unit.name), /* @__PURE__ */ React.createElement("td", null, unit.commander), /* @__PURE__ */ React.createElement("td", null, unit.contact), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline-primary me-2" }, /* @__PURE__ */ React.createElement(Pen, { size: 14 })), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-sm btn-outline-danger",
      onClick: () => handleDeleteUnit(unit.id)
    },
    /* @__PURE__ */ React.createElement(Trash2, { size: 14 })
  )))))))), activeTab === "vehicles" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "mb-4" }, "Vehicle Management"), /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("h6", { className: "mb-0" }, "Add New Vehicle")), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "BA Number",
      value: newVehicle.baNumber,
      onChange: (e) => setNewVehicle({ ...newVehicle, baNumber: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-2" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-select",
      value: newVehicle.type,
      onChange: (e) => setNewVehicle({ ...newVehicle, type: e.target.value })
    },
    /* @__PURE__ */ React.createElement("option", { value: "Jeep" }, "Jeep"),
    /* @__PURE__ */ React.createElement("option", { value: "5 Ton" }, "5 Ton"),
    /* @__PURE__ */ React.createElement("option", { value: "Motorcycle" }, "Motorcycle")
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-2" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-select",
      value: newVehicle.unit,
      onChange: (e) => setNewVehicle({ ...newVehicle, unit: e.target.value })
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "Select Unit"),
    units.map((unit) => /* @__PURE__ */ React.createElement("option", { key: unit.id, value: unit.name }, unit.name))
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-2" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-select",
      value: newVehicle.status,
      onChange: (e) => setNewVehicle({ ...newVehicle, status: e.target.value })
    },
    /* @__PURE__ */ React.createElement("option", { value: "Active" }, "Active"),
    /* @__PURE__ */ React.createElement("option", { value: "Maintenance" }, "Maintenance"),
    /* @__PURE__ */ React.createElement("option", { value: "Inactive" }, "Inactive")
  ))), /* @__PURE__ */ React.createElement("div", { className: "row mt-3" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-12" }, /* @__PURE__ */ React.createElement("button", { onClick: handleAddVehicle, className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(Plus, { size: 16, className: "me-1" }), " Add Vehicle"))))), /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "table table-bordered" }, /* @__PURE__ */ React.createElement("thead", { className: "table-light" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "BA Number"), /* @__PURE__ */ React.createElement("th", null, "Type"), /* @__PURE__ */ React.createElement("th", null, "Unit"), /* @__PURE__ */ React.createElement("th", null, "Status"), /* @__PURE__ */ React.createElement("th", null, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, vehicles.map((vehicle) => /* @__PURE__ */ React.createElement("tr", { key: vehicle.id }, /* @__PURE__ */ React.createElement("td", null, vehicle.baNumber), /* @__PURE__ */ React.createElement("td", null, vehicle.type), /* @__PURE__ */ React.createElement("td", null, vehicle.unit), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `badge ${vehicle.status === "Active" ? "bg-success" : vehicle.status === "Maintenance" ? "bg-warning" : "bg-secondary"}` }, vehicle.status)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-outline-primary me-2" }, /* @__PURE__ */ React.createElement(Pen, { size: 14 })), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-sm btn-outline-danger",
      onClick: () => handleDeleteVehicle(vehicle.id)
    },
    /* @__PURE__ */ React.createElement(Trash2, { size: 14 })
  )))))))), activeTab === "profiles" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "mb-4" }, "Profile Management"), /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("h6", { className: "mb-0" }, "Add New Profile")), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Username",
      value: newProfile.username,
      onChange: (e) => setNewProfile({ ...newProfile, username: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "password",
      className: "form-control",
      placeholder: "Password",
      value: newProfile.password,
      onChange: (e) => setNewProfile({ ...newProfile, password: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Full Name",
      value: newProfile.full_name,
      onChange: (e) => setNewProfile({ ...newProfile, full_name: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      className: "form-control",
      placeholder: "Email",
      value: newProfile.email,
      onChange: (e) => setNewProfile({ ...newProfile, email: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-1" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-select",
      value: newProfile.role,
      onChange: (e) => setNewProfile({ ...newProfile, role: e.target.value })
    },
    /* @__PURE__ */ React.createElement("option", { value: "user" }, "User"),
    /* @__PURE__ */ React.createElement("option", { value: "operator" }, "Operator"),
    /* @__PURE__ */ React.createElement("option", { value: "admin" }, "Admin")
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-2" }, /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-select",
      value: newProfile.unit_id,
      onChange: (e) => setNewProfile({ ...newProfile, unit_id: e.target.value })
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "Select Unit"),
    units.map((unit) => /* @__PURE__ */ React.createElement("option", { key: unit.id, value: unit.id }, unit.name))
  )), /* @__PURE__ */ React.createElement("div", { className: "col-md-1" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Contact",
      value: newProfile.contact_number,
      onChange: (e) => setNewProfile({ ...newProfile, contact_number: e.target.value })
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "row mt-3" }, /* @__PURE__ */ React.createElement("div", { className: "col-md-12" }, /* @__PURE__ */ React.createElement("button", { onClick: handleAddProfile, className: "btn btn-primary" }, /* @__PURE__ */ React.createElement(Plus, { size: 16, className: "me-1" }), " Add Profile"))))), /* @__PURE__ */ React.createElement("div", { className: "table-responsive" }, /* @__PURE__ */ React.createElement("table", { className: "table table-bordered" }, /* @__PURE__ */ React.createElement("thead", { className: "table-light" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Username"), /* @__PURE__ */ React.createElement("th", null, "Full Name"), /* @__PURE__ */ React.createElement("th", null, "Email"), /* @__PURE__ */ React.createElement("th", null, "Role"), /* @__PURE__ */ React.createElement("th", null, "Unit"), /* @__PURE__ */ React.createElement("th", null, "Contact"), /* @__PURE__ */ React.createElement("th", null, "Status"), /* @__PURE__ */ React.createElement("th", null, "Actions"))), /* @__PURE__ */ React.createElement("tbody", null, profiles.map((profile) => /* @__PURE__ */ React.createElement("tr", { key: profile.id }, /* @__PURE__ */ React.createElement("td", null, profile.username), /* @__PURE__ */ React.createElement("td", null, profile.full_name || "-"), /* @__PURE__ */ React.createElement("td", null, profile.email || "-"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `badge ${profile.role === "admin" ? "bg-danger" : profile.role === "operator" ? "bg-warning" : "bg-info"}` }, profile.role)), /* @__PURE__ */ React.createElement("td", null, profile.unit_name || "-"), /* @__PURE__ */ React.createElement("td", null, profile.contact_number || "-"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `badge ${profile.is_active ? "bg-success" : "bg-secondary"}` }, profile.is_active ? "Active" : "Inactive")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setEditingProfile(profile),
      className: "btn btn-sm btn-outline-primary me-2",
      disabled: profile.role === "admin"
    },
    /* @__PURE__ */ React.createElement(Pen, { size: 14 })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleDeleteProfile(profile.id),
      className: "btn btn-sm btn-outline-danger",
      disabled: profile.role === "admin"
    },
    /* @__PURE__ */ React.createElement(Trash2, { size: 14 })
  ))))))), editingProfile && /* @__PURE__ */ React.createElement("div", { className: "modal show d-block", style: { backgroundColor: "rgba(0,0,0,0.5)" } }, /* @__PURE__ */ React.createElement("div", { className: "modal-dialog" }, /* @__PURE__ */ React.createElement("div", { className: "modal-content" }, /* @__PURE__ */ React.createElement("div", { className: "modal-header" }, /* @__PURE__ */ React.createElement("h5", { className: "modal-title" }, "Edit Profile"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn-close",
      onClick: () => setEditingProfile(null)
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "modal-body" }, /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Username"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: editingProfile.username,
      onChange: (e) => setEditingProfile({ ...editingProfile, username: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Password"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "password",
      className: "form-control",
      placeholder: "Leave blank to keep current password",
      value: editingProfile.password || "",
      onChange: (e) => setEditingProfile({ ...editingProfile, password: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Full Name"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: editingProfile.full_name,
      onChange: (e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Email"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      className: "form-control",
      value: editingProfile.email,
      onChange: (e) => setEditingProfile({ ...editingProfile, email: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Role"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-select",
      value: editingProfile.role,
      onChange: (e) => setEditingProfile({ ...editingProfile, role: e.target.value })
    },
    /* @__PURE__ */ React.createElement("option", { value: "user" }, "User"),
    /* @__PURE__ */ React.createElement("option", { value: "operator" }, "Operator"),
    /* @__PURE__ */ React.createElement("option", { value: "admin" }, "Admin")
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Unit"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "form-select",
      value: editingProfile.unit_id || "",
      onChange: (e) => setEditingProfile({ ...editingProfile, unit_id: e.target.value })
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "Select Unit"),
    units.map((unit) => /* @__PURE__ */ React.createElement("option", { key: unit.id, value: unit.id }, unit.name))
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Contact Number"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      value: editingProfile.contact_number,
      onChange: (e) => setEditingProfile({ ...editingProfile, contact_number: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-check-input",
      type: "checkbox",
      checked: editingProfile.is_active,
      onChange: (e) => setEditingProfile({ ...editingProfile, is_active: e.target.checked })
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Active")))), /* @__PURE__ */ React.createElement("div", { className: "modal-footer" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-secondary",
      onClick: () => setEditingProfile(null)
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary",
      onClick: handleUpdateProfile
    },
    "Update Profile"
  ))))), activeTab === "notifications" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "mb-4" }, "SMS Alert Settings"), /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("h6", { className: "mb-0" }, "SMS Configuration")), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-check-input",
      type: "checkbox",
      checked: smsSettings.enabled,
      onChange: (e) => setSmsSettings({ ...smsSettings, enabled: e.target.checked })
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Enable SMS Alerts")), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Send SMS notifications for violations and emergencies")), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Emergency Contact Number"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "+92XXXXXXXXXX",
      value: smsSettings.emergencyContact,
      onChange: (e) => setSmsSettings({ ...smsSettings, emergencyContact: e.target.value })
    }
  ), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Primary contact for emergency alerts")))), /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("h6", { className: "mb-0" }, "Alert Recipients")), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-check-input",
      type: "checkbox",
      checked: smsSettings.unitCommanders,
      onChange: (e) => setSmsSettings({ ...smsSettings, unitCommanders: e.target.checked })
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Unit Commanders")), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Send alerts to unit commander contact numbers")), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-check-input",
      type: "checkbox",
      checked: smsSettings.systemAdmin,
      onChange: (e) => setSmsSettings({ ...smsSettings, systemAdmin: e.target.checked })
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "System Administrators")), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Send alerts to system admin contacts")))), /* @__PURE__ */ React.createElement("div", { className: "card mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "card-header" }, /* @__PURE__ */ React.createElement("h6", { className: "mb-0" }, "Violation Types")), /* @__PURE__ */ React.createElement("div", { className: "card-body" }, /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-check-input",
      type: "checkbox",
      checked: smsSettings.violationTypes.panic,
      onChange: (e) => setSmsSettings({
        ...smsSettings,
        violationTypes: { ...smsSettings.violationTypes, panic: e.target.checked }
      })
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Panic Button Alerts")), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Send SMS for panic button emergencies")), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-check-input",
      type: "checkbox",
      checked: smsSettings.violationTypes.overspeed,
      onChange: (e) => setSmsSettings({
        ...smsSettings,
        violationTypes: { ...smsSettings.violationTypes, overspeed: e.target.checked }
      })
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Overspeed Violations")), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Send SMS for overspeed violations")), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "form-check-input",
      type: "checkbox",
      checked: smsSettings.violationTypes.unsanctioned,
      onChange: (e) => setSmsSettings({
        ...smsSettings,
        violationTypes: { ...smsSettings.violationTypes, unsanctioned: e.target.checked }
      })
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Unauthorized Movement")), /* @__PURE__ */ React.createElement("small", { className: "text-muted" }, "Send SMS for unsanctioned vehicle movement")))), /* @__PURE__ */ React.createElement("div", { className: "d-flex gap-2" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => {
    localStorage.setItem("smsSettings", JSON.stringify(smsSettings));
    alert("SMS settings saved successfully!");
  } }, "Save SMS Settings"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-outline-secondary", onClick: () => {
    if (smsSettings.enabled && smsSettings.emergencyContact) {
      alert(`Test SMS would be sent to: ${smsSettings.emergencyContact}`);
    } else {
      alert("Please enable SMS and set emergency contact number first.");
    }
  } }, "Send Test SMS"))), activeTab === "security" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h5", { className: "mb-4" }, "Security Settings"), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Session Timeout (minutes)"), /* @__PURE__ */ React.createElement("input", { type: "number", className: "form-control", defaultValue: "30" })), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement("input", { className: "form-check-input", type: "checkbox", defaultChecked: true }), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Require Two-Factor Authentication"))), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("div", { className: "form-check form-switch" }, /* @__PURE__ */ React.createElement("input", { className: "form-check-input", type: "checkbox", defaultChecked: true }), /* @__PURE__ */ React.createElement("label", { className: "form-check-label" }, "Log Failed Login Attempts"))), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("label", { className: "form-label" }, "Password Policy"), /* @__PURE__ */ React.createElement("select", { className: "form-select" }, /* @__PURE__ */ React.createElement("option", null, "Strong (8+ characters, mixed case, numbers, symbols)"), /* @__PURE__ */ React.createElement("option", null, "Medium (6+ characters, mixed case, numbers)"), /* @__PURE__ */ React.createElement("option", null, "Basic (6+ characters)")))), /* @__PURE__ */ React.createElement("div", { className: "mt-4" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary me-2", onClick: activeTab === "overspeed" ? handleSaveOverspeedSettings : void 0 }, "Save Changes"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-secondary" }, "Reset to Default")))))));
}
export {
  Settings2 as default
};
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/bell.js:
lucide-react/dist/esm/icons/clock.js:
lucide-react/dist/esm/icons/map.js:
lucide-react/dist/esm/icons/moon.js:
lucide-react/dist/esm/icons/pen.js:
lucide-react/dist/esm/icons/plus.js:
lucide-react/dist/esm/icons/settings.js:
lucide-react/dist/esm/icons/shield.js:
lucide-react/dist/esm/icons/trash-2.js:
lucide-react/dist/esm/icons/user.js:
lucide-react/dist/esm/icons/users.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.562.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
