"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { searchCommands } from "@/data/portfolio";
import { Icon } from "./icon";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [modifier, setModifier] = useState("Ctrl");
  const navigating = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  // Whatever opened the menu gets focus back: the Ctrl K keys, the phone menu button, or the shortcut's origin.
  const opener = useRef<HTMLElement | null>(null);
  const results = searchCommands(query);
  const show = (next: boolean) => { if (next) opener.current = document.activeElement as HTMLElement | null; setOpen(next); };
  useEffect(() => {
    setModifier(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl");
    const shortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.ctrlKey || event.metaKey)) return;
      if ((event.target as HTMLElement).closest("input,textarea,[contenteditable=true]")) return;
      event.preventDefault();
      if (!open) opener.current = document.activeElement as HTMLElement | null;
      setOpen(!open);
    };
    const command = () => { opener.current = document.activeElement as HTMLElement | null; setOpen(true); };
    window.addEventListener("keydown", shortcut);
    document.addEventListener("portfolio:command", command);
    return () => { window.removeEventListener("keydown", shortcut); document.removeEventListener("portfolio:command", command); };
  }, [open]);
  useEffect(() => {
    document.dispatchEvent(new CustomEvent("portfolio:dialog", { detail: open }));
    if (open) { setQuery(""); setSelected(0); navigating.current = false; }
    return () => { document.dispatchEvent(new CustomEvent("portfolio:dialog", { detail: false })); };
  }, [open]);
  function choose(href: string) {
    const section = href !== "#theme" && !href.startsWith("mailto:");
    navigating.current = section; setOpen(false);
    if (href === "#theme") setTimeout(() => document.dispatchEvent(new Event("portfolio:toggle-theme")));
    else if (!section) location.href = href;
    else document.dispatchEvent(new CustomEvent("portfolio:navigate", { detail: href }));
  }
  const dark = typeof document !== "undefined" && document.documentElement.dataset.theme === "dark";
  return <Dialog.Root open={open} onOpenChange={show}>
    <Dialog.Trigger className="kbd" aria-label="Open command menu" ref={trigger}><kbd>{modifier}</kbd><kbd>K</kbd></Dialog.Trigger>
    <Dialog.Portal><Dialog.Overlay className="dialog-overlay" data-lenis-prevent />
      <Dialog.Content className="command-dialog" data-lenis-prevent onCloseAutoFocus={event => {
        event.preventDefault();
        if (navigating.current) return;
        const back = opener.current?.isConnected && opener.current.checkVisibility() ? opener.current : trigger.current;
        back?.focus();
      }}>
        <Dialog.Title className="sr-only">Command menu</Dialog.Title><Dialog.Description className="sr-only">Search for a section or action and press Enter.</Dialog.Description>
        <div className="command-search"><Icon name="search" /><input aria-label="Search sections" placeholder="Search for a section…" value={query} role="combobox" aria-autocomplete="list" aria-controls="command-results" aria-expanded="true" aria-activedescendant={results[selected] ? `command-${selected}` : undefined} onChange={event => { setQuery(event.target.value); setSelected(0); }} onKeyDown={event => {
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && results.length) { event.preventDefault(); setSelected(index => (index + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length); }
          if (event.key === "Enter" && results[selected]) { event.preventDefault(); choose(results[selected].href); }
        }} /><Dialog.Close aria-label="Close command menu" className="dialog-close"><Icon name="close" /></Dialog.Close></div>
        <div id="command-results" role="listbox" aria-label="Sections" className="command-results">{results.length ? results.map((command, index) => <div role="option" aria-selected={selected === index} id={`command-${index}`} key={command.href} className="command-option" onMouseEnter={() => setSelected(index)} onClick={() => choose(command.href)}>
          <Icon name={command.href === "#theme" ? dark ? "sun" : "moon" : command.href.startsWith("mailto:") ? "mail" : "chev"} />{command.label}</div>) : <p className="no-results" role="status">No matching section.</p>}</div>
        <div className="command-help"><span>↑ ↓ navigate</span><span>↵ select</span><span>esc close</span></div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
