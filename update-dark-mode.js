import fs from 'fs';

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { regex: /bg-\[\#F8FAFC\]/g, to: 'bg-[#F8FAFC] dark:bg-slate-950' },
  { regex: /(?<!dark:)bg-white/g, to: 'bg-white dark:bg-slate-900' },
  { regex: /(?<!dark:)text-slate-900/g, to: 'text-slate-900 dark:text-white' },
  { regex: /(?<!dark:)text-slate-800/g, to: 'text-slate-800 dark:text-slate-100' },
  { regex: /(?<!dark:)text-slate-600/g, to: 'text-slate-600 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-500/g, to: 'text-slate-500 dark:text-slate-400' },
  { regex: /(?<!dark:)border-slate-200/g, to: 'border-slate-200 dark:border-slate-800' },
  { regex: /(?<!dark:)border-slate-100/g, to: 'border-slate-100 dark:border-slate-800/50' },
  { regex: /(?<!dark:)bg-slate-50/g, to: 'bg-slate-50 dark:bg-slate-900/50' },
  { regex: /(?<!dark:)bg-slate-100/g, to: 'bg-slate-100 dark:bg-slate-800' },
  { regex: /(?<!dark:)hover:bg-slate-100/g, to: 'hover:bg-slate-100 dark:hover:bg-slate-800' },
  { regex: /(?<!dark:)shadow-sm/g, to: 'shadow-sm dark:shadow-none' },
];

for (const { regex, to } of replacements) {
  content = content.replace(regex, to);
}

fs.writeFileSync(file, content);
console.log('App.tsx updated');
