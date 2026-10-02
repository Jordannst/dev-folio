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
  const results = searchCommands(query);
  useEffect(() => {
    setModifier(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl");
    const shortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.ctrlKey || event.metaKey)) return;
      if ((event.target as HTMLElement).closest("input,textarea,[contenteditable=true]")) return;
      event.preventDefault(); setOpen(prev => !prev);
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    document.dispatchEvent(new CustomEvent("portfolio:dialog", { detail: open }));
    if (open) { setQuery(""); setSelected(0); navigating.current = false; }
    return () => { document.dispatchEvent(new CustomEvent("portfolio:dialog", { detail: false })); };
  }, [open]);
  function choose(href: string) {
    navigating.current = true; setOpen(false);
    document.dispatchEvent(new CustomEvent("portfolio:navigate", { detail: href }));
  }
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger className="command-trigger" aria-label="Open command menu" ref={trigger}><kbd>{modifier}</kbd><kbd>K</kbd></Dialog.Trigger>
    <Dialog.Portal><Dialog.Overlay className="dialog-overlay" data-lenis-prevent />
      <Dialog.Content className="command-dialog" data-lenis-prevent onCloseAutoFocus={event => { event.preventDefault(); if (!navigating.current) trigger.current?.focus(); }}>
        <Dialog.Title className="sr-only">Command menu</Dialog.Title><Dialog.Description className="sr-only">Search for a section and press Enter to navigate.</Dialog.Description>
        <div className="command-search"><Icon name="search" /><input aria-label="Search sections" placeholder="Search for a command to run…" value={query} role="combobox" aria-autocomplete="list" aria-controls="command-results" aria-expanded="true" aria-activedescendant={results[selected] ? `command-${selected}` : undefined} onChange={event => { setQuery(event.target.value); setSelected(0); }} onKeyDown={event => {
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && results.length) { event.preventDefault(); setSelected(index => (index + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length); }
          if (event.key === "Enter" && results[selected]) { event.preventDefault(); choose(results[selected].href); }
        }} /><Dialog.Close aria-label="Close command menu" className="dialog-close"><Icon name="close" /></Dialog.Close></div>
        <div id="command-results" role="listbox" aria-label="Sections" className="command-results">{results.length ? results.map((command, index) => <div role="option" aria-selected={selected === index} id={`command-${index}`} key={command.href} className="command-option" onMouseEnter={() => setSelected(index)} onClick={() => choose(command.href)}><span aria-hidden="true">⌁</span>{command.label}<span className="command-enter" aria-hidden="true">↵</span></div>) : <p className="no-results" role="status">No results found.</p>}</div>
        <div className="command-help"><span>↑ ↓ to navigate</span><span>↵ to select</span><span>esc to close</span></div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
