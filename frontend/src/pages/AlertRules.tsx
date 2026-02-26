import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  ShieldAlert,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Search,
  AlertTriangle,
  Info,
  Zap,
  Loader2,
} from 'lucide-react';
import { alertRuleApi } from '@/services/api';

// ───────── Constants ─────────

const CONDITION_FIELDS = [
  {
    group: 'Mileage Since Service', items: [
      { value: 'mileage_since_oil_change', label: 'Mileage since oil change' },
      { value: 'mileage_since_tire_rotation', label: 'Mileage since tire rotation' },
      { value: 'mileage_since_brake_check', label: 'Mileage since brake check' },
    ]
  },
  {
    group: 'Days Since Service', items: [
      { value: 'days_since_oil_change', label: 'Days since oil change' },
      { value: 'days_since_tire_rotation', label: 'Days since tire rotation' },
      { value: 'days_since_brake_check', label: 'Days since brake check' },
      { value: 'days_since_general_inspection', label: 'Days since general inspection' },
    ]
  },
  {
    group: 'Expiry Countdown', items: [
      { value: 'registration_expiry_days', label: 'Registration expires within (days)' },
      { value: 'insurance_expiry_days', label: 'Insurance expires within (days)' },
    ]
  },
  {
    group: 'Vehicle Property', items: [
      { value: 'current_mileage', label: 'Current mileage (km)' },
      { value: 'vehicle_age', label: 'Vehicle age (years)' },
    ]
  },
  {
    group: 'Component Condition', items: [
      { value: 'battery_condition', label: 'Battery condition' },
      { value: 'brake_fluid_condition', label: 'Brake fluid condition' },
      { value: 'coolant_condition', label: 'Coolant condition' },
      { value: 'engine_belt_condition', label: 'Engine belt condition' },
      { value: 'distribution_chain_condition', label: 'Distribution chain condition' },
    ]
  },
];

const COMPONENT_FIELDS = [
  'battery_condition',
  'brake_fluid_condition',
  'coolant_condition',
  'engine_belt_condition',
  'distribution_chain_condition',
];

const OPERATORS: Record<string, { value: string; label: string }[]> = {
  mileage: [
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
  ],
  days: [
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
  ],
  expiry: [
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
  ],
  property: [
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
    { value: '=', label: '=' },
  ],
  component: [
    { value: '=', label: '=' },
  ],
};

const COMPONENT_VALUES = ['good', 'fair', 'poor', 'unknown'];

function getOperatorGroup(field: string) {
  if (field.startsWith('mileage_since')) return 'mileage';
  if (field.startsWith('days_since')) return 'days';
  if (field.endsWith('_expiry_days')) return 'expiry';
  if (COMPONENT_FIELDS.includes(field)) return 'component';
  return 'property';
}

const severityConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; ring: string }> = {
  urgent: {
    icon: <Zap className="w-4 h-4" />,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    ring: 'ring-red-200 dark:ring-red-800',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    ring: 'ring-amber-200 dark:ring-amber-800',
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    ring: 'ring-blue-200 dark:ring-blue-800',
  },
};

// ───────── Types ─────────

interface AlertRule {
  _id: string;
  name: string;
  description?: string;
  conditionField: string;
  operator: string;
  value: number | string;
  severity: 'info' | 'warning' | 'urgent';
  isActive: boolean;
  createdBy?: { firstName: string; lastName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
  conditionField: string;
  operator: string;
  value: string;
  severity: string;
}

const emptyForm: FormData = {
  name: '',
  description: '',
  conditionField: '',
  operator: '',
  value: '',
  severity: 'warning',
};

// ───────── Component ─────────

const AlertRules = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Fetch ──
  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await alertRuleApi.getAll();
      setRules(res.data.data);
    } catch {
      toast.error('Failed to load alert rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRules(); }, [loadRules]);

  // ── Helpers ──
  const fieldLabel = (field: string) => {
    for (const g of CONDITION_FIELDS) {
      for (const i of g.items) {
        if (i.value === field) return i.label;
      }
    }
    return field;
  };

  const filtered = rules.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase()) ||
    fieldLabel(r.conditionField).toLowerCase().includes(search.toLowerCase())
  );

  // ── Modal handling ──
  const openCreate = () => {
    setEditingRule(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      description: rule.description || '',
      conditionField: rule.conditionField,
      operator: rule.operator,
      value: String(rule.value),
      severity: rule.severity,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRule(null);
    setForm(emptyForm);
  };

  // ── When conditionField changes, reset operator if invalid ──
  const handleFieldChange = (field: string) => {
    const group = getOperatorGroup(field);
    const ops = OPERATORS[group];
    setForm(prev => ({
      ...prev,
      conditionField: field,
      operator: ops.length === 1 ? ops[0].value : '',
      value: '',
    }));
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.conditionField || !form.operator || form.value === '') {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const isComponent = COMPONENT_FIELDS.includes(form.conditionField);
      const payload = {
        name: form.name,
        description: form.description || undefined,
        conditionField: form.conditionField,
        operator: form.operator,
        value: isComponent ? form.value : Number(form.value),
        severity: form.severity,
      };

      if (editingRule) {
        await alertRuleApi.update(editingRule._id, payload);
        toast.success('Rule updated');
      } else {
        await alertRuleApi.create(payload as Parameters<typeof alertRuleApi.create>[0]);
        toast.success('Rule created');
      }
      closeModal();
      loadRules();
    } catch {
      toast.error('Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ──
  const handleToggle = async (rule: AlertRule) => {
    try {
      await alertRuleApi.update(rule._id, { isActive: !rule.isActive });
      setRules(prev => prev.map(r => r._id === rule._id ? { ...r, isActive: !r.isActive } : r));
      toast.success(`Rule ${rule.isActive ? 'disabled' : 'enabled'}`);
    } catch {
      toast.error('Failed to toggle rule');
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    try {
      await alertRuleApi.delete(id);
      setRules(prev => prev.filter(r => r._id !== id));
      setDeleteConfirm(null);
      toast.success('Rule deleted');
    } catch {
      toast.error('Failed to delete rule');
    }
  };

  // ── Operators for current field ──
  const currentOps = form.conditionField ? OPERATORS[getOperatorGroup(form.conditionField)] : [];
  const isComponentField = COMPONENT_FIELDS.includes(form.conditionField);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary-600" />
            Alert Rules
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Define custom conditions that trigger alerts across your fleet
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Rule
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search rules…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition"
        />
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {search ? 'No rules match your search' : 'No alert rules yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {search ? 'Try a different search term.' : 'Create your first custom alert rule to monitor your fleet automatically.'}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Rule
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(rule => {
            const sev = severityConfig[rule.severity] || severityConfig.info;
            return (
              <div
                key={rule._id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-all hover:shadow-md ${!rule.isActive ? 'opacity-60' : ''
                  }`}
              >
                {/* Severity badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${sev.color} ${sev.bg} ${sev.ring}`}>
                    {sev.icon}
                    {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)}
                  </span>
                  <button
                    onClick={() => handleToggle(rule)}
                    className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title={rule.isActive ? 'Disable rule' : 'Enable rule'}
                  >
                    {rule.isActive ? <ToggleRight className="w-7 h-7 text-primary-600 dark:text-primary-400" /> : <ToggleLeft className="w-7 h-7" />}
                  </button>
                </div>

                {/* Title & description */}
                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {rule.name}
                </h3>
                {rule.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {rule.description}
                  </p>
                )}

                {/* Condition pill */}
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg font-mono">
                  {fieldLabel(rule.conditionField)} {rule.operator} {rule.value}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => openEdit(rule)}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  {deleteConfirm === rule._id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 dark:text-red-400">Delete?</span>
                      <button onClick={() => handleDelete(rule._id)} className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400">Yes</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(rule._id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create / Edit Modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

          {/* Panel */}
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingRule ? 'Edit Rule' : 'Create New Rule'}
              </h2>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Rule Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Brake Check Overdue"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 outline-none transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe when this rule should trigger…"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 outline-none transition resize-none"
                />
              </div>

              {/* Condition Builder */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 space-y-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Condition
                </p>

                {/* Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Field <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.conditionField}
                    onChange={e => handleFieldChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 outline-none transition"
                  >
                    <option value="">Select field…</option>
                    {CONDITION_FIELDS.map(group => (
                      <optgroup key={group.group} label={group.group}>
                        {group.items.map(item => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Operator + Value */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Operator <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.operator}
                      onChange={e => setForm(f => ({ ...f, operator: e.target.value }))}
                      disabled={!form.conditionField}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 outline-none transition disabled:opacity-50"
                    >
                      <option value="">Select…</option>
                      {currentOps.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Value <span className="text-red-500">*</span>
                    </label>
                    {isComponentField ? (
                      <select
                        value={form.value}
                        onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 outline-none transition"
                      >
                        <option value="">Select…</option>
                        {COMPONENT_VALUES.map(v => (
                          <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={form.value}
                        onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                        placeholder="Threshold"
                        disabled={!form.conditionField}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-300 outline-none transition disabled:opacity-50"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity
                </label>
                <div className="flex gap-3">
                  {(['info', 'warning', 'urgent'] as const).map(s => {
                    const cfg = severityConfig[s];
                    const selected = form.severity === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, severity: s }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${selected
                            ? `${cfg.bg} ${cfg.color} border-current`
                            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                          }`}
                      >
                        {cfg.icon}
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingRule ? 'Save Changes' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertRules;
