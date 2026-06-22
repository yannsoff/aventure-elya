import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, TOTAL_WEEKS } from '@/store/useGameStore';
import { Icon, REWARD_ICONS } from '@/components/Icon';
import { storage } from '@/storage/DexieAdapter';
import { getAllSkills, getItemById } from '@/content/seed';
import { WEEK_META, DAY_SHORT } from '@/content/weeksMeta';
import type { Item } from '@/types';
import { sfx } from '@/audio/sfx';

const DEFAULT_PIN = '0000';

const RESOURCES = [
  { label: 'Oxford Owl — e-books gratuits', url: 'https://www.oxfordowl.co.uk/for-home/find-a-book/library-page/' },
  { label: 'Teach Your Monster to Read', url: 'https://www.teachyourmonster.org/' },
  { label: 'Phonics Play', url: 'https://www.phonicsplay.co.uk/' },
  { label: 'Topmarks — jeux maths 5-7 ans', url: 'https://www.topmarks.co.uk/maths-games/5-7-years/counting' },
  { label: 'ICT Games (phonics & maths)', url: 'https://www.ictgames.com/' },
  { label: 'White Rose — 1-Minute Maths', url: 'https://whiteroseeducation.com/1-minute-maths' },
  { label: 'BBC Bitesize KS1', url: 'https://www.bbc.co.uk/bitesize/early-and-1st-level' },
  { label: 'DoodleEnglish / DoodleMaths', url: 'https://doodlelearning.com/' },
];

type Tab = 'progress' | 'consolidate' | 'rewards' | 'resources' | 'settings';

function itemLabel(item: Item): string {
  const p = item.payload;
  if (p.word) return `« ${p.word} »`;
  if (p.letter) return `lettre ${p.letter}`;
  if (p.name) return 'prénom';
  if (p.grapheme) return `son ${p.grapheme}`;
  if (p.total !== undefined) return `${p.part} + ? = ${p.total}`;
  if (p.n !== undefined) return `double de ${p.n}`;
  if (p.a !== undefined) return `${p.a} ${p.op} ${p.b}`;
  if (p.number !== undefined) return `nombre ${p.number}`;
  if (p.denom !== undefined) return `fraction 1/${p.denom}`;
  if (p.table !== undefined) return `${p.groups} × ${p.table}`;
  if (p.hour !== undefined) return `${p.hour}:${String(p.minute).padStart(2, '0')}`;
  if (p.step !== undefined) return `compter en ${p.step}`;
  return item.id;
}

export function ParentZone() {
  const setScreen = useGameStore((s) => s.setScreen);
  const [unlocked, setUnlocked] = useState(false);
  const [entry, setEntry] = useState('');
  const [pin, setPin] = useState(DEFAULT_PIN);
  const [tab, setTab] = useState<Tab>('progress');

  useEffect(() => {
    storage.getSetting<string>('pin').then((p) => setPin(p ?? DEFAULT_PIN));
  }, []);

  const press = (d: string) => {
    sfx.tap();
    const next = (entry + d).slice(0, 4);
    setEntry(next);
    if (next.length === 4) {
      if (next === pin) setUnlocked(true);
      else {
        sfx.soft();
        window.setTimeout(() => setEntry(''), 400);
      }
    }
  };

  if (!unlocked) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
        <button
          type="button"
          aria-label="Retour"
          onClick={() => setScreen('map')}
          className="absolute left-4 top-[max(env(safe-area-inset-top),16px)] grid h-12 w-12 place-items-center rounded-full bg-white/80 shadow-soft"
        >
          <Icon name="ArrowLeft" size={24} />
        </button>
        <Icon name="Lock" size={48} className="text-grape" />
        <h1 className="font-display text-2xl font-extrabold">Espace parent</h1>
        <p className="text-sm text-ink/50">Code par défaut : 0000</p>
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-5 w-5 rounded-full ${i < entry.length ? 'bg-grape' : 'bg-white border-2 border-grape/30'}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
            k === '' ? (
              <div key={i} />
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => (k === '⌫' ? setEntry((e) => e.slice(0, -1)) : press(k))}
                className="h-16 w-16 rounded-full bg-white font-display text-2xl font-extrabold text-ink shadow-soft active:scale-90"
              >
                {k}
              </button>
            ),
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),14px)]">
        <button
          type="button"
          aria-label="Retour"
          onClick={() => setScreen('map')}
          className="grid h-11 w-11 place-items-center rounded-full bg-white/80 shadow-soft"
        >
          <Icon name="ArrowLeft" size={22} />
        </button>
        <h1 className="font-display text-2xl font-extrabold text-ink">Espace parent</h1>
      </div>

      {/* Tabs */}
      <div className="scroll-x flex gap-2 overflow-x-auto px-4 py-3">
        {([
          ['progress', 'Progrès'],
          ['consolidate', 'À consolider'],
          ['rewards', 'Récompenses'],
          ['resources', 'Ressources'],
          ['settings', 'Réglages'],
        ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              sfx.tap();
              setTab(t);
            }}
            className={`whitespace-nowrap rounded-pill px-4 py-2 font-display text-sm font-extrabold shadow-soft ${
              tab === t ? 'bg-accent text-white' : 'bg-white text-ink/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="scroll-y h-[calc(100%-130px)] px-4 pb-10">
        {tab === 'progress' && <ProgressTab />}
        {tab === 'consolidate' && <ConsolidateTab />}
        {tab === 'rewards' && <RewardsTab />}
        {tab === 'resources' && <ResourcesTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 rounded-blob bg-white p-4 shadow-soft">{children}</div>;
}

function ProgressTab() {
  const progress = useGameStore((s) => s.progress);
  const daySessions = useGameStore((s) => s.daySessions);
  const masteries = useGameStore((s) => s.masteries);
  const validateDay = useGameStore((s) => s.validateDay);
  const skills = getAllSkills();

  return (
    <div>
      <Card>
        <div className="flex justify-around text-center">
          <Stat icon="Star" value={progress.totalStars} label="étoiles" />
          <Stat icon="Flame" value={progress.streak} label="jours de suite" />
          <Stat icon="Crown" value={progress.level} label="niveau" />
        </div>
      </Card>

      <h2 className="mb-2 font-display text-lg font-extrabold">Journal des jours</h2>
      {Array.from({ length: TOTAL_WEEKS }).map((_, w) => {
        const sessions = daySessions.filter((s) => s.weekIndex === w);
        if (sessions.length === 0) return null;
        return (
          <Card key={w}>
            <div className="mb-2 font-display font-extrabold" style={{ color: WEEK_META[w].color }}>
              Semaine {w + 1} — {WEEK_META[w].name}
            </div>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4].map((d) => {
                const s = sessions.find((x) => x.dayIndex === d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => s?.completed || validateDay(w, d)}
                    className={`flex flex-col items-center rounded-2xl px-3 py-2 text-xs font-bold shadow-soft ${
                      s?.completed ? 'bg-leaf text-white' : 'bg-ink/5 text-ink/40'
                    }`}
                  >
                    <span>{DAY_SHORT[d]}</span>
                    {s?.completed ? (
                      <span className="flex items-center gap-1">
                        <Icon name="Star" size={12} /> {s.starsEarned}
                      </span>
                    ) : (
                      <span>Valider</span>
                    )}
                    {s?.validatedByParent && <Icon name="Check" size={12} />}
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}

      <h2 className="mb-2 mt-2 font-display text-lg font-extrabold">Maîtrise par compétence</h2>
      {skills.map((sk) => {
        const items = masteries.filter((m) => getItemById(m.itemId)?.skillId === sk.id);
        const mastered = items.filter((m) => m.box === 4).length;
        const seen = items.length;
        return (
          <div key={sk.id} className="mb-2 rounded-2xl bg-white p-3 shadow-soft">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-ink">{sk.label}</span>
              <span className="text-ink/50">{mastered} maîtrisés{seen ? ` / ${seen} vus` : ''}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-pill bg-ink/10">
              <div className="h-full rounded-pill bg-accent" style={{ width: `${seen ? (mastered / seen) * 100 : 0}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <Icon name={icon} size={24} className="text-accent" />
      <span className="font-display text-2xl font-extrabold">{value}</span>
      <span className="text-xs text-ink/50">{label}</span>
    </div>
  );
}

function ConsolidateTab() {
  const masteries = useGameStore((s) => s.masteries);
  const bank = masteries
    .filter((m) => m.timesWrong > 0 && m.box < 4)
    .sort((a, b) => b.timesWrong - a.timesWrong);

  return (
    <div>
      <Card>
        <p className="text-sm text-ink/60">
          Voici les notions sur lesquelles Elya s'entraîne encore. La plateforme les fait revenir
          automatiquement à chaque séance jusqu'à ce qu'elles soient acquises.
        </p>
      </Card>
      {bank.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Icon name="Sparkles" size={32} className="text-leaf" />
            <p className="font-display font-extrabold">Rien à consolider pour l'instant !</p>
          </div>
        </Card>
      ) : (
        bank.map((m) => {
          const item = getItemById(m.itemId);
          if (!item) return null;
          return (
            <div key={m.itemId} className="mb-2 flex items-center justify-between rounded-2xl bg-white p-3 shadow-soft">
              <span className="font-bold text-ink">{itemLabel(item)}</span>
              <span className="flex items-center gap-1 rounded-pill bg-sun/20 px-3 py-1 text-sm font-bold text-coral">
                <Icon name="Heart" size={14} /> {m.timesWrong}× à revoir
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}

function RewardsTab() {
  const rewards = useGameStore((s) => s.rewards);
  const setReward = useGameStore((s) => s.setReward);

  return (
    <div>
      <Card>
        <p className="text-sm text-ink/60">
          Définis la récompense réelle pour chaque semaine (ex. « une glace »). Elya la découvrira en
          ouvrant le coffre après ses 5 jours.
        </p>
      </Card>
      {Array.from({ length: TOTAL_WEEKS }).map((_, w) => {
        const r = rewards.find((x) => x.weekIndex === w);
        return (
          <Card key={w}>
            <div className="mb-2 font-display font-extrabold" style={{ color: WEEK_META[w].color }}>
              Semaine {w + 1}
            </div>
            <input
              defaultValue={r?.label ?? ''}
              placeholder="Récompense (ex. une glace)"
              onBlur={(e) =>
                setReward({ weekIndex: w, label: e.target.value, icon: r?.icon ?? 'Gift', claimed: r?.claimed ?? false })
              }
              className="mb-3 w-full rounded-pill bg-ink/5 px-4 py-2 font-bold text-ink outline-none ring-accent focus:ring-2"
            />
            <div className="flex flex-wrap gap-2">
              {REWARD_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() =>
                    setReward({ weekIndex: w, label: r?.label ?? '', icon, claimed: r?.claimed ?? false })
                  }
                  className={`grid h-10 w-10 place-items-center rounded-full ${
                    r?.icon === icon ? 'bg-accent text-white' : 'bg-ink/5 text-ink/60'
                  }`}
                >
                  <Icon name={icon} size={20} />
                </button>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ResourcesTab() {
  return (
    <div>
      <Card>
        <p className="text-sm text-ink/60">Pour aller plus loin (sites gratuits, adaptés 5-7 ans).</p>
      </Card>
      {RESOURCES.map((r) => (
        <a
          key={r.url}
          href={r.url}
          target="_blank"
          rel="noreferrer"
          className="mb-2 flex items-center justify-between rounded-2xl bg-white p-4 shadow-soft active:scale-95"
        >
          <span className="font-bold text-ink">{r.label}</span>
          <Icon name="ArrowRight" size={20} className="text-accent" />
        </a>
      ))}
    </div>
  );
}

function SettingsTab() {
  const muted = useGameStore((s) => s.muted);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const unlockAllDays = useGameStore((s) => s.unlockAllDays);
  const setUnlockAllDays = useGameStore((s) => s.setUnlockAllDays);
  const resetWeek = useGameStore((s) => s.resetWeek);
  const resetAll = useGameStore((s) => s.resetAll);
  const exportData = useGameStore((s) => s.exportData);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetWeekIndex, setResetWeekIndex] = useState(0);

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aventure-elya-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Card>
        <Toggle label="Son et voix" value={!muted} onChange={() => toggleMute()} />
        <div className="my-3 h-px bg-ink/10" />
        <Toggle
          label="Déverrouiller tous les jours"
          hint="Permet de jouer plusieurs jours d'affilée sans attendre."
          value={unlockAllDays}
          onChange={(v) => setUnlockAllDays(v)}
        />
      </Card>

      <Card>
        <p className="mb-2 font-display font-extrabold">Sauvegarde</p>
        <button
          type="button"
          onClick={handleExport}
          className="flex w-full items-center justify-center gap-2 rounded-pill bg-grape px-4 py-3 font-display font-extrabold text-white shadow-soft active:scale-95"
        >
          <Icon name="Star" size={18} /> Exporter les données (JSON)
        </button>
      </Card>

      <Card>
        <p className="mb-2 font-display font-extrabold">Réinitialiser une semaine</p>
        <div className="flex items-center gap-2">
          <select
            value={resetWeekIndex}
            onChange={(e) => setResetWeekIndex(Number(e.target.value))}
            className="flex-1 rounded-pill bg-ink/5 px-4 py-2 font-bold"
          >
            {Array.from({ length: TOTAL_WEEKS }).map((_, w) => (
              <option key={w} value={w}>
                Semaine {w + 1}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => resetWeek(resetWeekIndex)}
            className="rounded-pill bg-coral px-4 py-2 font-display font-extrabold text-white active:scale-95"
          >
            Reset
          </button>
        </div>
      </Card>

      <Card>
        <p className="mb-2 font-display font-extrabold text-coral">Zone dangereuse</p>
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="w-full rounded-pill bg-ink/10 px-4 py-3 font-display font-extrabold text-ink/70 active:scale-95"
          >
            Tout effacer et recommencer
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => resetAll()}
              className="flex-1 rounded-pill bg-coral px-4 py-3 font-display font-extrabold text-white"
            >
              Oui, tout effacer
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="flex-1 rounded-pill bg-ink/10 px-4 py-3 font-display font-extrabold text-ink/70"
            >
              Annuler
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-bold text-ink">{label}</p>
        {hint && <p className="text-xs text-ink/50">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-8 w-14 rounded-full transition ${value ? 'bg-leaf' : 'bg-ink/20'}`}
      >
        <motion.span layout className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow ${value ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}
