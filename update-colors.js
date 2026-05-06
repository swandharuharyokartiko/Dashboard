import fs from 'fs';

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  // StatusBadge styles
  { regex: /'APPROVED': 'bg-emerald-50 text-emerald-600 ring-emerald-100',/g, to: "'APPROVED': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-500/20'," },
  { regex: /'REJECT': 'bg-red-50 text-red-600 ring-red-100',/g, to: "'REJECT': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 ring-red-100 dark:ring-red-500/20'," },
  { regex: /'CANCELED': 'bg-orange-50 text-orange-600 ring-orange-100',/g, to: "'CANCELED': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-100 dark:ring-orange-500/20'," },
  { regex: /'CREDIT ANALYST': 'bg-purple-50 text-purple-600 ring-purple-100',/g, to: "'CREDIT ANALYST': 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-100 dark:ring-purple-500/20'," },
  { regex: /'SURVEYING': 'bg-blue-50 text-blue-600 ring-blue-100',/g, to: "'SURVEYING': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-100 dark:ring-blue-500/20'," },
  { regex: /'APPLICATION IN': 'bg-slate-50 dark:bg-slate-900\/50 text-slate-600 dark:text-slate-300 ring-slate-100',/g, to: "'APPLICATION IN': 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-slate-100 dark:ring-slate-500/20'," },
  { regex: /'CUSTOMER VERIFICATION': 'bg-cyan-50 text-cyan-600 ring-cyan-100',/g, to: "'CUSTOMER VERIFICATION': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-cyan-100 dark:ring-cyan-500/20'," },
  { regex: /const currentStyle \= styles\[status\] \|\| 'bg-slate-50 dark:bg-slate-900\/50 text-slate-500 dark:text-slate-400 ring-slate-100';/g, to: "const currentStyle = styles[status] || 'bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 ring-slate-100 dark:ring-slate-500/20';" },

  // Table inner spans
  { regex: /text-emerald-600 bg-emerald-50\/50 px-2\.5 py-1 rounded-lg ring-1 ring-emerald-100\/50/g, to: "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg ring-1 ring-emerald-100/50 dark:ring-emerald-500/20" },
  { regex: /text-amber-600 bg-amber-50\/50 px-2\.5 py-1 rounded-lg ring-1 ring-amber-100\/50/g, to: "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg ring-1 ring-amber-100/50 dark:ring-amber-500/20" },
  { regex: /text-indigo-600 bg-indigo-50\/50 px-2\.5 py-1 rounded-lg ring-1 ring-indigo-100\/50/g, to: "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg ring-1 ring-indigo-100/50 dark:ring-indigo-500/20" },
  { regex: /text-rose-600 bg-rose-50\/50 px-2\.5 py-1 rounded-lg ring-1 ring-rose-100\/50/g, to: "text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg ring-1 ring-rose-100/50 dark:ring-rose-500/20" },
  { regex: /text-blue-600 bg-blue-50\/50 px-2\.5 py-1 rounded-lg ring-1 ring-blue-100\/50/g, to: "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg ring-1 ring-blue-100/50 dark:ring-blue-500/20" },

  // Passenger vs Commercial
  { regex: /"bg-blue-50 text-blue-600 border-blue-100"/g, to: '"bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"' },
  { regex: /"bg-orange-50 text-orange-600 border-orange-100"/g, to: '"bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20"' },

  // CheckCircle
  { regex: /bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100\/50/g, to: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100/50 dark:border-emerald-500/20" },

  // Admin login error box
  { regex: /bg-rose-50 border border-rose-100 text-rose-600/g, to: "bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400" },

  // Google Sheets Connection Header bg
  { regex: /bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600/g, to: "bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400" },

  // How to connect box
  { regex: /bg-amber-50\/50 border-t border-amber-100/g, to: "bg-amber-50/50 dark:bg-amber-500/5 border-t border-amber-100 dark:border-amber-500/20" },
  { regex: /text-amber-800/g, to: "text-amber-800 dark:text-amber-500" },
  { regex: /text-amber-900\/80/g, to: "text-amber-900/80 dark:text-amber-200/80" },
  { regex: /text-amber-900"/g, to: 'text-amber-900 dark:text-amber-400"' },

  // Blue header icon app explorer
  { regex: /bg-blue-50 rounded-2xl/g, to: "bg-blue-50 dark:bg-blue-500/10 rounded-2xl" },
];

for (const { regex, to } of replacements) {
  content = content.replace(regex, to);
}

fs.writeFileSync(file, content);
console.log('Colors updated');
