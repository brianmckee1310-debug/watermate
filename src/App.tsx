import { useMemo, useRef, useState } from "react";
import {
  DAY_NAMES, addDays, diffDays, dueText, effEvery, everyText, feedDue, mood, nextWaterDay, niceDay, push, schedule,
  snapDue, today, todayView, water, weekday, active, toDate,
  type Place, type SceneKind, type State, type Thing,
} from "./logic";
import { SPECIES, WORDS, plantFrom, speciesById, starterState, uid, type Species } from "./seed";
import { useStore, type Store } from "./store";
import { Scene, SCENE_LABEL, INDOOR_SCENES, OUTDOOR_SCENES } from "./scenes";
import { ThingSprite } from "./Sprite";
import { Btn, Burst, I, Icon, Sheet, Stepper, useLeave } from "./ui";
import { LEAF_TINTS, POT_TINTS } from "./sprites/color";
import { PET_TINTS } from "./sprites/PetSprite";

const VERSION = "1.0";
type Tab = "today" | "home" | "plan" | "settings";
type Modal =
  | null
  | { k: "thing"; id: string }
  | { k: "add"; placeId?: string | null }
  | { k: "place"; id: string | "new" }
  | { k: "move"; placeId: string };

const placeName = (s: State, id: string | null) => s.places.find((p) => p.id === id)?.name ?? "Not placed yet";
const patch = (id: string, fn: (t: Thing) => Thing) => (s: State): State => ({ ...s, things: s.things.map((t) => (t.id === id ? fn(t) : t)) });

function doWater(store: Store, ids: string[], day: string) {
  const s0 = store.state;
  const names = s0.things.filter((t) => ids.includes(t.id));
  store.act((s) => ({ ...s, things: s.things.map((t) => (ids.includes(t.id) ? water(t, day, s.settings, feedDue(t, day)) : t)) }),
    names.length === 1 ? `${WORDS[names[0].kind].done} ${names[0].name}` : `${names.length} things done`);
}
function doPush(store: Store, id: string, to: string, day: string) {
  const t = store.state.things.find((x) => x.id === id)!;
  const next = push(t, to, day);
  store.act(patch(id, () => next),
    `${t.name} pushed to ${niceDay(to, day)}${next.every !== t.every ? ` · now ${everyText(next.every)}` : ""}`);
}

export default function App() {
  const store = useStore();
  const { state } = store;
  const [tab, setTab] = useState<Tab>("today");
  const [modal, setModal] = useState<Modal>(null);
  const [room, setRoom] = useState<string | null | undefined>(undefined); // undefined = closed, null = unplaced
  const day = today();
  const view = useMemo(() => todayView(state, day), [state, day]);

  return (
    <div className="app">
      <main key={tab} className="screen">
        {tab === "today" && <Today store={store} day={day} open={(id) => setModal({ k: "thing", id })} goHome={() => setTab("home")} />}
        {tab === "home" && <Home store={store} day={day} openRoom={setRoom} addRoom={() => setModal({ k: "place", id: "new" })} />}
        {tab === "plan" && <Plan store={store} day={day} open={(id) => setModal({ k: "thing", id })} />}
        {tab === "settings" && <SettingsScreen store={store} />}
      </main>

      {room !== undefined && (
        <RoomView store={store} day={day} placeId={room} close={() => setRoom(undefined)}
          open={(id) => setModal({ k: "thing", id })} add={() => setModal({ k: "add", placeId: room })}
          move={() => room && setModal({ k: "move", placeId: room })} edit={() => room && setModal({ k: "place", id: room })} />
      )}

      <nav className="nav">
        <NavBtn on={tab === "today"} icon={I.drop} label="Today" badge={view.now.length} onClick={() => { setRoom(undefined); setTab("today"); }} />
        <NavBtn on={tab === "home"} icon={I.home} label="Home" onClick={() => { setRoom(undefined); setTab("home"); }} />
        <button type="button" className="fab" onClick={() => setModal({ k: "add", placeId: room ?? null })} aria-label="Add something"><Icon d={I.plus} size={28} /></button>
        <NavBtn on={tab === "plan"} icon={I.cal} label="Plan" onClick={() => { setRoom(undefined); setTab("plan"); }} />
        <NavBtn on={tab === "settings"} icon={I.gear} label="Settings" onClick={() => { setRoom(undefined); setTab("settings"); }} />
      </nav>

      {store.toast && (
        <div className="toast" key={store.toast.id}>
          <span>{store.toast.text}</span>
          {store.toast.undo && <button type="button" onClick={store.undo}>Undo</button>}
        </div>
      )}

      {modal?.k === "thing" && state.things.some((t) => t.id === modal.id) && (
        <ThingSheet store={store} day={day} id={modal.id} close={() => setModal(null)} />
      )}
      {modal?.k === "add" && <AddSheet store={store} placeId={modal.placeId ?? null} close={() => setModal(null)} />}
      {modal?.k === "place" && <PlaceSheet store={store} id={modal.id} close={() => setModal(null)} onDeleted={() => setRoom(undefined)} />}
      {modal?.k === "move" && <MoveSheet store={store} placeId={modal.placeId} day={day} close={() => setModal(null)} />}
    </div>
  );
}

function NavBtn({ on, icon, label, onClick, badge }: { on: boolean; icon: string; label: string; onClick: () => void; badge?: number }) {
  return (
    <button type="button" className={`nav-btn${on ? " on" : ""}`} onClick={onClick}>
      <span className="nav-ico"><Icon d={icon} fill={on && icon === I.drop} />{!!badge && <b>{badge}</b>}</span>
      {label}
    </button>
  );
}

// ---------------------------------------------------------------- Today -----
function Today({ store, day, open, goHome }: { store: Store; day: string; open: (id: string) => void; goHome: () => void }) {
  const { state } = store;
  const v = todayView(state, day);
  const groups = (list: Thing[]) => {
    const order = [...state.places.map((p) => p.id), null];
    return order.map((pid) => ({ pid, things: list.filter((t) => (t.placeId ?? null) === pid) })).filter((g) => g.things.length);
  };
  const d = toDate(day);
  const wd = state.settings.waterDays;
  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">{d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
          <h1>{v.now.length === 0 ? "All watered" : v.now.length === 1 ? "1 thing needs you" : `${v.now.length} things need you`}</h1>
        </div>
      </header>

      {v.now.length === 0 && (
        <div className="calm">
          <div className="calm-art">
            {state.things.slice(0, 5).map((t, i) => <span key={t.id} style={{ animationDelay: `${i * 0.35}s` }}><ThingSprite t={t} mood={mood(t, day)} size={72} /></span>)}
          </div>
          <p className="calm-big">Nothing to water today.</p>
          {v.nextDay && <p className="muted">Next up: {v.nextCount} {v.nextCount === 1 ? "thing" : "things"} {niceDay(v.nextDay, day) === "tomorrow" ? "tomorrow" : `on ${niceDay(v.nextDay, day)}`}.</p>}
          <Btn tone="cream" onClick={goHome}>Visit the house</Btn>
        </div>
      )}

      {v.now.length >= 3 && (
        <div className="all-row">
          <Btn wide onClick={() => doWater(store, v.now.map((t) => t.id), day)}><Icon d={I.drop} fill size={18} /> Did everything ({v.now.length})</Btn>
        </div>
      )}

      {groups(v.now).map((g) => (
        <section key={String(g.pid)} className="group">
          <div className="group-head">
            <h2>{placeName(state, g.pid)}</h2>
            {g.things.length > 1 && <button type="button" className="link" onClick={() => doWater(store, g.things.map((t) => t.id), day)}>All {g.things.length} done</button>}
          </div>
          {g.things.map((t) => <DueCard key={t.id} t={t} store={store} day={day} open={open} />)}
        </section>
      ))}

      {v.soon.length > 0 && (
        <section className="group soon">
          <div className="group-head">
            <h2>While you're at it</h2>
            <span className="muted small">due in a day or two</span>
          </div>
          {v.soon.map((t) => <DueCard key={t.id} t={t} store={store} day={day} open={open} early />)}
        </section>
      )}

      <p className="foot muted small">
        Watering days: {wd.length ? wd.map((n) => DAY_NAMES[n]).join(" · ") : "any day"} — due dates lean toward these so things come due together.
      </p>
    </>
  );
}

function DueCard({ t, store, day, open, early }: { t: Thing; store: Store; day: string; open: (id: string) => void; early?: boolean }) {
  const [pushing, setPushing] = useState(false);
  const target = useRef<string | null>(null);
  const [ref, phase, leave] = useLeave(() => (target.current ? doPush(store, t.id, target.current, day) : doWater(store, [t.id], day)));
  const w = WORDS[t.kind];
  const m = phase === "wet" ? "watered" : mood(t, day);
  const feed = feedDue(t, day);
  const nwd = nextWaterDay(day, store.state.settings.waterDays);
  const opts = [...new Map([[addDays(day, 1), "Tomorrow"], [nwd, diffDays(nwd, day) === 1 ? "Tomorrow" : DAY_NAMES[weekday(nwd)]], [addDays(day, 7), "1 week"]]).entries()];
  const n = diffDays(t.due, day);
  return (
    <div ref={ref} className={`card-wrap ${phase}`}>
      <div className={`card ${feed ? "feed" : ""} ${early ? "early" : ""} ${n < 0 ? "late" : ""}`}>
        <button type="button" className={`card-main mood-${m}`} onClick={() => open(t.id)}>
          <span className="sprite"><ThingSprite t={t} mood={m} size={66} /></span>
          <span className="card-text">
            <strong>{t.name}{t.count && t.count > 1 ? <em> ×{t.count}</em> : null}</strong>
            <span className={`status ${n < 0 ? "late" : ""}`}>{dueText(t, day)} · {everyText(effEvery(t, day, store.state.settings))}</span>
            {feed && <span className="chip brown">+ {w.extra}</span>}
          </span>
        </button>
        <div className="card-actions">
          {!pushing ? (
            <>
              <Btn tone={feed ? "brown" : "blue"} onClick={() => leave("wet")}><Icon d={I.drop} fill size={17} /> {early ? `${w.verb} early` : feed ? `${w.verb} + ${w.extra}` : w.done}</Btn>
              {!early && <Btn tone="cream" onClick={() => setPushing(true)}><Icon d={I.clock} size={17} /> Not yet</Btn>}
            </>
          ) : (
            <div className="push-row">
              {opts.map(([to, label]) => <Btn key={to} small tone="cream" onClick={() => { target.current = to; leave("pushed"); }}>{label}</Btn>)}
              <button type="button" className="icon-btn" onClick={() => setPushing(false)} aria-label="Cancel"><Icon d={I.x} size={18} /></button>
            </div>
          )}
        </div>
        {phase === "wet" && <Burst tint={feed ? "#a9794f" : undefined} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- Home -----
function RoomCard({ place, things, day, onClick, index }: { place: { name: string; scene: SceneKind; paused?: boolean; quiet?: boolean }; things: Thing[]; day: string; onClick: () => void; index: number }) {
  const thirsty = place.paused || place.quiet ? 0 : things.filter((t) => diffDays(t.due, day) <= 0).length;
  const show = things.slice(0, 6);
  return (
    <button type="button" className={`room ${place.paused ? "paused" : ""}`} onClick={onClick} style={{ animationDelay: `${index * 45}ms` }}>
      <Scene kind={place.scene} className="room-art" />
      <div className="room-things">
        {show.map((t) => { const m = mood(t, day); return <span key={t.id} className={`mood-${place.paused ? "thriving" : m}`}><ThingSprite t={t} mood={place.paused ? "thriving" : m} size={58} noFace={things.length > 4} /></span>; })}
        {things.length > show.length && <span className="more">+{things.length - show.length}</span>}
      </div>
      <div className="room-label">
        <strong>{place.name}</strong>
        {place.paused ? <span className="chip">resting</span> : place.quiet ? <span className="chip">quiet</span>
          : thirsty > 0 ? <span className="chip blue"><Icon d={I.drop} fill size={12} /> {thirsty}</span>
          : things.length > 0 ? <span className="chip sage"><Icon d={I.check} size={12} /> happy</span> : <span className="chip">empty</span>}
      </div>
    </button>
  );
}

function Home({ store, day, openRoom, addRoom }: { store: Store; day: string; openRoom: (id: string | null) => void; addRoom: () => void }) {
  const { state } = store;
  const loose = state.things.filter((t) => !t.placeId || !state.places.some((p) => p.id === t.placeId));
  const of = (p: Place) => state.things.filter((t) => t.placeId === p.id);
  let i = 0;
  return (
    <>
      <header className="top"><div><div className="eyebrow">{state.things.length} things in your care</div><h1>Home</h1></div></header>
      {loose.length > 0 && (
        <section className="group">
          <div className="group-head"><h2>Not placed yet</h2><span className="muted small">open a room to move them in</span></div>
          <RoomCard place={{ name: `${loose.length} waiting for a room`, scene: "shelf" }} things={loose} day={day} onClick={() => openRoom(null)} index={i++} />
        </section>
      )}
      {(["in", "out"] as const).map((side) => (
        <section key={side} className="group">
          <div className="group-head"><h2>{side === "in" ? "Inside" : "Outside"}</h2></div>
          <div className="rooms">
            {state.places.filter((p) => p.side === side).map((p) => <RoomCard key={p.id} place={p} things={of(p)} day={day} onClick={() => openRoom(p.id)} index={i++} />)}
          </div>
        </section>
      ))}
      <div className="all-row"><Btn tone="cream" wide onClick={addRoom}><Icon d={I.plus} size={18} /> Add a room or spot</Btn></div>
    </>
  );
}

function RoomView({ store, day, placeId, close, open, add, move, edit }: {
  store: Store; day: string; placeId: string | null; close: () => void; open: (id: string) => void; add: () => void; move: () => void; edit: () => void;
}) {
  const { state } = store;
  const place = state.places.find((p) => p.id === placeId);
  const things = state.things.filter((t) => (place ? t.placeId === place.id : !t.placeId || !state.places.some((p) => p.id === t.placeId)));
  const resting = !!(place?.paused || place?.quiet);
  const due = resting ? [] : things.filter((t) => diffDays(t.due, day) <= 0);
  const shelves: Thing[][] = [];
  for (let k = 0; k < things.length; k += 4) shelves.push(things.slice(k, k + 4));
  const others = state.things.length - things.length;
  return (
    <div className="roomview">
      <div className="room-hero">
        <Scene kind={place?.scene ?? "shelf"} className="room-art" />
        <button type="button" className="icon-btn float left" onClick={close} aria-label="Back"><Icon d={I.back} /></button>
        {place && <button type="button" className="icon-btn float right" onClick={edit} aria-label="Room settings"><Icon d={I.gear} /></button>}
        <div className="hero-title"><h1>{place?.name ?? "Not placed yet"}</h1>
          <span>{things.length === 0 ? "Nothing here yet" : resting ? (place?.paused ? "Resting for the season" : "Quiet — no reminders") : due.length ? `${due.length} thirsty` : "Everyone's happy"}</span></div>
      </div>
      <div className="room-body">
        {due.length > 1 && <div className="all-row"><Btn wide onClick={() => doWater(store, due.map((t) => t.id), day)}><Icon d={I.drop} fill size={18} /> All {due.length} done</Btn></div>}
        {shelves.map((row, r) => (
          <div className="shelf" key={r}>
            <div className="shelf-row">
              {row.map((t) => {
                const m = resting ? "thriving" : mood(t, day);
                return (
                  <button type="button" key={t.id} className={`shelf-item mood-${m}`} onClick={() => open(t.id)}>
                    <ThingSprite t={t} mood={m} size={92} />
                    <strong>{t.name}</strong>
                    <span className={`status ${!resting && diffDays(t.due, day) < 0 ? "late" : ""}`}>{resting ? "resting" : dueText(t, day)}</span>
                  </button>
                );
              })}
            </div>
            <div className="plank" />
          </div>
        ))}
        {things.length === 0 && <p className="muted center pad">This room is empty. Move something in, or add something new.</p>}
        <div className="two">
          {place && others > 0 && <Btn tone="cream" wide onClick={move}><Icon d={I.move} size={18} /> Move things here</Btn>}
          <Btn tone="sage" wide onClick={add}><Icon d={I.plus} size={18} /> Add new</Btn>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- Plan -----
function Plan({ store, day, open }: { store: Store; day: string; open: (id: string) => void }) {
  const { state } = store;
  const days = schedule(state, day);
  return (
    <>
      <header className="top"><div><div className="eyebrow">next 5 weeks</div><h1>Plan</h1></div></header>
      <WaterDays store={store} />
      {days.length === 0 && <p className="muted center pad">Nothing scheduled.</p>}
      {days.map(({ day: d, things }, i) => (
        <section key={d} className={`plan-day ${state.settings.waterDays.includes(weekday(d)) ? "wd" : ""}`} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
          <div className="plan-date">
            <strong>{diffDays(d, day) <= 1 ? niceDay(d, day) : toDate(d).toLocaleDateString(undefined, { weekday: "long" })}</strong>
            <span>{toDate(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            <b>{things.length}</b>
          </div>
          <div className="plan-things">
            {things.map((t) => (
              <button type="button" key={t.id} className="mini" onClick={() => open(t.id)}>
                <ThingSprite t={t} mood={d === day ? mood(t, day) : "thriving"} size={44} noFace />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function WaterDays({ store }: { store: Store }) {
  const wd = store.state.settings.waterDays;
  const toggle = (n: number) => store.act((s) => {
    const next = wd.includes(n) ? wd.filter((x) => x !== n) : [...wd, n].sort();
    return { ...s, settings: { ...s.settings, waterDays: next } };
  });
  const regroup = () => {
    const d = today();
    store.act((s) => ({ ...s, things: s.things.map((t) => (diffDays(t.due, d) > 0 ? { ...t, due: snapDue(t.due, t.every, s.settings.waterDays, d) } : t)) }), "Regrouped onto your watering days");
  };
  return (
    <div className="panel">
      <div className="panel-title">My watering days</div>
      <div className="days">
        {DAY_NAMES.map((n, i) => <button type="button" key={n} className={wd.includes(i) ? "on" : ""} onClick={() => toggle(i)}>{n}</button>)}
      </div>
      <p className="muted small">Due dates lean toward these days so plants come due together. Daily and every-few-days things stay on their own beat.</p>
      <Btn small tone="cream" onClick={regroup}>Regroup everything now</Btn>
    </div>
  );
}

// ------------------------------------------------------------- Settings -----
function SettingsScreen({ store }: { store: Store }) {
  const { state } = store;
  const [confirm, setConfirm] = useState(false);
  const backup = () => {
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `watermate-backup-${today()}.json`; a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const restore = (f: File | undefined) => {
    if (!f) return;
    f.text().then((txt) => {
      const s = JSON.parse(txt);
      if (s?.v !== 1 || !Array.isArray(s.things) || !Array.isArray(s.places)) throw new Error("bad");
      const prev = state; store.replace(s); store.say("Backup restored", prev);
    }).catch(() => store.say("That file isn't a WaterMate backup"));
  };
  return (
    <>
      <header className="top"><div><div className="eyebrow">WaterMate {VERSION}</div><h1>Settings</h1></div></header>
      <WaterDays store={store} />
      <div className="panel">
        <label className="switch-row">
          <span><strong>Follow the seasons</strong><em>Plants wait about 1.5× longer Dec–Feb, a bit shorter Jun–Aug. Feeding pauses Oct–Feb.</em></span>
          <input type="checkbox" checked={state.settings.seasonal} onChange={(e) => store.act((s) => ({ ...s, settings: { ...s.settings, seasonal: e.target.checked } }))} />
        </label>
      </div>
      <div className="panel">
        <div className="panel-title">Backup</div>
        <p className="muted small">Everything lives on this phone. Save a backup file now and then, or to move to another device.</p>
        <div className="two">
          <Btn tone="cream" wide onClick={backup}>Save backup</Btn>
          <label className="btn cream wide file">Restore<input type="file" accept="application/json,.json" onChange={(e) => restore(e.target.files?.[0])} /></label>
        </div>
      </div>
      <div className="panel">
        <div className="panel-title">Start over</div>
        {!confirm ? <Btn small tone="cream" onClick={() => setConfirm(true)}>Reset to the starter list</Btn>
          : <div className="two"><Btn tone="clay" wide onClick={() => { const prev = state; store.replace(starterState()); store.say("Reset to the starter list", prev); setConfirm(false); }}>Yes, reset</Btn><Btn tone="cream" wide onClick={() => setConfirm(false)}>Cancel</Btn></div>}
      </div>
    </>
  );
}

// ---------------------------------------------------------- Thing sheet -----
function ThingSheet({ store, day, id, close }: { store: Store; day: string; id: string; close: () => void }) {
  const { state } = store;
  const t = state.things.find((x) => x.id === id)!;
  const sp = t.speciesId ? speciesById.get(t.speciesId) : undefined;
  const w = WORDS[t.kind];
  const m = mood(t, day);
  const set = (p: Partial<Thing>) => store.act(patch(id, (x) => ({ ...x, ...p })));
  const [more, setMore] = useState(false);
  const [del, setDel] = useState(false);
  const live = active(t, state.places);
  const eff = effEvery(t, day, state.settings);
  const setLast = (d: string) => { if (!d || diffDays(d, day) > 0) return; set({ last: d, due: addDays(d, eff) }); };
  const tints = t.kind === "pet" ? PET_TINTS : LEAF_TINTS;
  return (
    <Sheet onClose={close} tall title={<input className="name-input" value={t.name} onChange={(e) => set({ name: e.target.value })} aria-label="Name" />}>
      <div className={`hero-sprite mood-${m}`}><ThingSprite t={t} mood={m} size={150} /></div>
      <div className="center">
        <span className={`chip big ${diffDays(t.due, day) <= 0 && live ? "blue" : "sage"}`}>{!live ? "resting" : diffDays(t.due, day) <= 0 ? dueText(t, day) : `next: ${niceDay(t.due, day)}`}</span>
        {sp && <div className="muted small sci">{sp.scientificName}</div>}
      </div>
      <div className="two">
        <Btn wide tone={feedDue(t, day) ? "brown" : "blue"} onClick={() => { doWater(store, [id], day); }}><Icon d={I.drop} fill size={17} /> {feedDue(t, day) ? `${w.verb} + ${w.extra}` : `${w.done} today`}</Btn>
        <Btn wide tone="cream" onClick={() => doPush(store, id, nextWaterDay(day, state.settings.waterDays), day)}><Icon d={I.clock} size={17} /> Not yet</Btn>
      </div>

      <div className="rows">
        <div className="row"><span>Lives in</span>
          <select value={t.placeId ?? ""} onChange={(e) => set({ placeId: e.target.value || null })}>
            <option value="">Not placed yet</option>
            {state.places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="row"><span>{w.unit}</span><Stepper value={t.every} onChange={(n) => set({ every: n })} label={everyText} /></div>
        {eff !== t.every && <div className="note">Right now: {everyText(eff)} (season adjusted)</div>}
        <div className="row"><span>{w.extraLong}</span><Stepper value={t.feedEvery} min={0} max={180} onChange={(n) => set({ feedEvery: n })} label={(n) => (n === 0 ? "off" : everyText(n))} /></div>
        <div className="row"><span>Last {w.done.toLowerCase()}</span><input type="date" max={day} value={t.last ?? ""} onChange={(e) => setLast(e.target.value)} /></div>
        <div className="row"><span>Next due</span><input type="date" min={day} value={t.due} onChange={(e) => e.target.value && set({ due: e.target.value })} /></div>
        {t.kind === "pet" && <div className="row"><span>How many</span><Stepper value={t.count ?? 1} max={99} onChange={(n) => set({ count: n })} label={(n) => String(n)} /></div>}
      </div>

      {sp && (
        <div className="care">
          <p><b>Water</b>{sp.waterHowTo}</p>
          <p><b>Light</b>{sp.light}</p>
          <p><b>Feed</b>{sp.fertilizer}</p>
          {more && <>
            <p><b>Humidity</b>{sp.humidity}</p>
            <p><b>Watch for</b>{sp.commonMistakes.join(" ")}</p>
            {sp.propagation && <p><b>Propagate</b>{sp.propagation}</p>}
            <p><b>Pets</b>{sp.petSafe ? "Listed as non-toxic to cats and dogs*" : "Keep away from cats and dogs — can be toxic."}{sp.petSafe && <em className="muted"> *best-effort, not vet advice</em>}</p>
          </>}
          <button type="button" className="link" onClick={() => setMore(!more)}>{more ? "Less" : "More care notes"}</button>
        </div>
      )}

      {t.kind !== "system" && (
        <div className="swatches">
          <span className="muted small">{t.kind === "pet" ? "Color" : "Leaves"}</span>
          <div>{tints.map((c) => <button type="button" key={c} style={{ background: c }} className={(t.kind === "pet" ? t.tint : t.leafColor) === c ? "on" : ""} onClick={() => set(t.kind === "pet" ? { tint: c } : { leafColor: c })} aria-label={c} />)}</div>
          {t.kind === "plant" && <><span className="muted small">Pot</span>
            <div>{POT_TINTS.map((c) => <button type="button" key={c} style={{ background: c }} className={t.potColor === c ? "on" : ""} onClick={() => set({ potColor: c })} aria-label={c} />)}</div></>}
        </div>
      )}

      <textarea className="notes" placeholder="Notes (pot size, quirks…)" value={t.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} rows={2} />

      {t.history.length > 0 && (
        <div className="history">
          <div className="panel-title">Recent</div>
          {t.history.slice(0, 6).map((e, i) => <div key={i}><span>{e.t === "water" ? w.done : e.t === "feed" ? w.extraLong : "Pushed"}</span><span className="muted">{niceDay(e.d, day)}</span></div>)}
        </div>
      )}

      {!del ? <button type="button" className="link danger" onClick={() => setDel(true)}>Remove {t.name}</button>
        : <div className="two"><Btn tone="clay" wide onClick={() => { close(); window.setTimeout(() => store.act((s) => ({ ...s, things: s.things.filter((x) => x.id !== id) }), `Removed ${t.name}`), 230); }}>Yes, remove</Btn><Btn tone="cream" wide onClick={() => setDel(false)}>Keep</Btn></div>}
    </Sheet>
  );
}

// ------------------------------------------------------------ Add sheet -----
const PET_KINDS = ["cat", "dog", "chicken", "bird", "rabbit", "other"];
function AddSheet({ store, placeId, close }: { store: Store; placeId: string | null; close: () => void }) {
  const { state } = store;
  const [mode, setMode] = useState<"plant" | "pet" | "other">("plant");
  const [q, setQ] = useState("");
  const [where, setWhere] = useState<string>(placeId ?? "");
  const [name, setName] = useState("");
  const [petKind, setPetKind] = useState("cat");
  const [every, setEvery] = useState(2);
  const [count, setCount] = useState(1);
  const [added, setAdded] = useState<string[]>([]);
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = !s ? SPECIES : SPECIES.filter((x) => (x.commonName + " " + x.scientificName + " " + x.aliases.join(" ")).toLowerCase().includes(s));
    return list.slice(0, 40);
  }, [q]);
  const addPlant = (sp: Species) => {
    store.act((s) => ({ ...s, things: [...s.things, plantFrom(sp, { placeId: where || null })] }));
    setAdded((a) => [sp.id, ...a]);
  };
  const addOther = () => {
    const base = { id: uid(), placeId: where || null, every, due: today(), last: null, feedEvery: 0, feedLast: null, history: [] };
    const thing: Thing = mode === "pet"
      ? { ...base, kind: "pet", petKind, count, name: name.trim() || petKind[0].toUpperCase() + petKind.slice(1) }
      : { ...base, kind: "system", name: name.trim() || "Water system" };
    store.act((s) => ({ ...s, things: [...s.things, thing] }), `Added ${thing.name}`);
    close();
  };
  return (
    <Sheet onClose={close} tall title="Add to your home">
      <div className="seg">
        {(["plant", "pet", "other"] as const).map((k) => <button type="button" key={k} className={mode === k ? "on" : ""} onClick={() => { setMode(k); setEvery(k === "other" ? 7 : 2); }}>{k === "plant" ? "Plant" : k === "pet" ? "Animal" : "Something else"}</button>)}
      </div>
      <div className="row"><span>Goes in</span>
        <select value={where} onChange={(e) => setWhere(e.target.value)}>
          <option value="">Not placed yet</option>
          {state.places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      {mode === "plant" ? (
        <>
          <input className="search" placeholder={`Search ${SPECIES.length} plants…`} value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="results">
            {hits.map((sp) => {
              const n = added.filter((a) => a === sp.id).length;
              return (
                <button type="button" key={sp.id} className={`result ${n ? "added" : ""}`} onClick={() => addPlant(sp)}>
                  <ThingSprite t={{ id: sp.id, speciesId: sp.id, kind: "plant" } as Thing} mood="thriving" size={46} noFace />
                  <span><strong>{sp.commonName}</strong><em>{everyText(sp.waterEveryDays)} · {sp.light.split(/[.;]/)[0].toLowerCase()}</em></span>
                  <b>{n ? `✓ ${n > 1 ? n : ""}` : "+"}</b>
                </button>
              );
            })}
            {hits.length === 0 && (
              <div className="pad center">
                <p className="muted">Not in the list. Add it with your own schedule:</p>
                <Btn tone="sage" onClick={() => { store.act((s) => ({ ...s, things: [...s.things, { id: uid(), kind: "plant", speciesId: "custom", name: q.trim(), placeId: where || null, every: 7, due: today(), last: null, feedEvery: 30, feedLast: null, history: [] }] }), `Added ${q.trim()}`); close(); }}>Add "{q.trim()}" · weekly</Btn>
              </div>
            )}
          </div>
          {added.length > 0 && <Btn wide onClick={close}>Done · {added.length} added</Btn>}
        </>
      ) : (
        <>
          {mode === "pet" && <div className="pets">{PET_KINDS.map((k) => (
            <button type="button" key={k} className={petKind === k ? "on" : ""} onClick={() => setPetKind(k)}>
              <ThingSprite t={{ id: k, kind: "pet", petKind: k } as Thing} mood="thriving" size={56} /><span>{k}</span>
            </button>))}</div>}
          <input className="search" placeholder={mode === "pet" ? "Name (e.g. Chickens)" : "Name (e.g. Rain barrel, Bird bath)"} value={name} onChange={(e) => setName(e.target.value)} />
          <div className="rows">
            {mode === "pet" && <div className="row"><span>How many</span><Stepper value={count} max={99} onChange={setCount} label={(n) => String(n)} /></div>}
            <div className="row"><span>{mode === "pet" ? "Fresh water" : "Tend it"}</span><Stepper value={every} onChange={setEvery} label={everyText} /></div>
          </div>
          <Btn wide tone="sage" onClick={addOther}>Add</Btn>
        </>
      )}
    </Sheet>
  );
}

// ---------------------------------------------------------- Place sheet -----
function PlaceSheet({ store, id, close, onDeleted }: { store: Store; id: string | "new"; close: () => void; onDeleted: () => void }) {
  const existing = store.state.places.find((p) => p.id === id);
  const [p, setP] = useState<Place>(existing ?? { id: uid(), name: "", side: "in", scene: "living" });
  const [del, setDel] = useState(false);
  const scenes = p.side === "in" ? INDOOR_SCENES : OUTDOOR_SCENES;
  const save = () => {
    const place = { ...p, name: p.name.trim() || SCENE_LABEL[p.scene] };
    store.act((s) => ({ ...s, places: existing ? s.places.map((x) => (x.id === place.id ? place : x)) : [...s.places, place] }));
    close();
  };
  return (
    <Sheet onClose={close} tall title={existing ? "Room settings" : "New room or spot"}>
      <input className="search" placeholder="Name (e.g. Dining room, Side porch)" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
      <div className="seg">
        {(["in", "out"] as const).map((k) => <button type="button" key={k} className={p.side === k ? "on" : ""} onClick={() => setP({ ...p, side: k, scene: k === "in" ? "living" : "yard" })}>{k === "in" ? "Inside" : "Outside"}</button>)}
      </div>
      <div className="scene-pick">
        {scenes.map((k) => <button type="button" key={k} className={p.scene === k ? "on" : ""} onClick={() => setP({ ...p, scene: k })}><Scene kind={k} /><span>{SCENE_LABEL[k]}</span></button>)}
      </div>
      <div className="panel flat">
        <label className="switch-row"><span><strong>Resting for the season</strong><em>Nothing here asks for water until you switch this off.</em></span>
          <input type="checkbox" checked={!!p.paused} onChange={(e) => setP({ ...p, paused: e.target.checked })} /></label>
        <label className="switch-row"><span><strong>Quiet</strong><em>Watered automatically (sprinkler, drip). Keep it in the house, never in Today.</em></span>
          <input type="checkbox" checked={!!p.quiet} onChange={(e) => setP({ ...p, quiet: e.target.checked })} /></label>
      </div>
      <Btn wide tone="sage" onClick={save}>{existing ? "Save" : "Add room"}</Btn>
      {existing && (!del ? <button type="button" className="link danger" onClick={() => setDel(true)}>Delete this room</button>
        : <div className="two"><Btn tone="clay" wide onClick={() => { store.act((s) => ({ ...s, places: s.places.filter((x) => x.id !== p.id), things: s.things.map((t) => (t.placeId === p.id ? { ...t, placeId: null } : t)) }), `Deleted ${p.name}`); onDeleted(); close(); }}>Delete (things stay)</Btn><Btn tone="cream" wide onClick={() => setDel(false)}>Keep</Btn></div>)}
    </Sheet>
  );
}

// ----------------------------------------------------------- Move sheet -----
function MoveSheet({ store, placeId, day, close }: { store: Store; placeId: string; day: string; close: () => void }) {
  const { state } = store;
  const [pick, setPick] = useState<string[]>([]);
  const list = state.things.filter((t) => t.placeId !== placeId).sort((a, b) => Number(!!a.placeId) - Number(!!b.placeId));
  const toggle = (id: string) => setPick((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  return (
    <Sheet onClose={close} tall title={`Move into ${placeName(state, placeId)}`}>
      <div className="pick-grid">
        {list.map((t) => (
          <button type="button" key={t.id} className={pick.includes(t.id) ? "on" : ""} onClick={() => toggle(t.id)}>
            <ThingSprite t={t} mood={mood(t, day)} size={64} noFace />
            <strong>{t.name}</strong><em>{t.placeId ? placeName(state, t.placeId) : "not placed"}</em>
            {pick.includes(t.id) && <i><Icon d={I.check} size={14} /></i>}
          </button>
        ))}
      </div>
      <div className="sticky"><Btn wide tone="sage" disabled={!pick.length} onClick={() => { store.act((s) => ({ ...s, things: s.things.map((t) => (pick.includes(t.id) ? { ...t, placeId } : t)) }), `Moved ${pick.length} into ${placeName(state, placeId)}`); close(); }}>{pick.length ? `Move ${pick.length} here` : "Tap things to move"}</Btn></div>
    </Sheet>
  );
}
