import { PickAnswer, type Choice } from '@/components/PickAnswer';
import { Icon } from '@/components/Icon';
import { nearbyNumbers } from './helpers';
import type { GameProps } from './types';

// Times Groups: equal groups for the 2 / 5 / 10 (and 3) tables.
export function TimesGroups({ item, onAnswer }: GameProps) {
  const table = item.payload.table as number;
  const groups = item.payload.groups as number;
  const answer = table * groups;

  const choices: Choice[] = nearbyNumbers(answer, 4, 0, 60).map((v) => ({
    id: `n-${v}`,
    correct: v === answer,
    ariaLabel: String(v),
    node: <span>{v}</span>,
  }));

  return (
    <PickAnswer
      instruction={[
        { text: `Il y a ${groups} paniers avec ${table} dedans. Combien en tout ?`, lang: 'fr-FR' },
      ]}
      titleFr={`${groups} × ${table}`}
      header={
        <div className="flex flex-wrap items-center justify-center gap-3">
          {Array.from({ length: groups }).map((_, g) => (
            <div key={g} className="grid grid-cols-5 gap-1 rounded-2xl bg-white/70 p-2 shadow-soft">
              {Array.from({ length: table }).map((_, i) => (
                <Icon key={i} name="Apple" size={18} className="text-coral" />
              ))}
            </div>
          ))}
        </div>
      }
      choices={choices}
      onAnswer={onAnswer}
      columns={4}
      tileClassName="h-20 w-20 rounded-full text-3xl bg-grape text-white"
    />
  );
}
