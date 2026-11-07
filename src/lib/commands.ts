export type Command = { label: string; href: string };

export function searchCommands<T extends Command>(commands: readonly T[], query: string): T[] {
  return commands.filter(command => command.label.toLowerCase().includes(query.trim().toLowerCase()));
}
