import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TEAMS,
  GROUP_IDS,
  THIRD_SLOTS,
  assignThirdPlaceSlots,
  buildKnockoutTree,
  applyWinners,
  type KnockoutTree,
} from './tournament.ts';
import type { GroupId } from './types.ts';

// ── Config sanity ────────────────────────────────────────────────────────────
test('48 teams, 12 groups of 4', () => {
  assert.equal(TEAMS.length, 48);
  for (const g of GROUP_IDS) {
    assert.equal(TEAMS.filter((t) => t.group === g).length, 4, `group ${g} size`);
  }
});

test('team codes are unique', () => {
  const codes = new Set(TEAMS.map((t) => t.code));
  assert.equal(codes.size, 48);
});

test('every team has a valid tier 1..5', () => {
  for (const t of TEAMS) assert.ok(t.tier >= 1 && t.tier <= 5, `${t.code} tier`);
});

test('third-place candidate lists never contain their own group winner', () => {
  // The R32 slot host is the group winner facing the third; assert the slot's
  // candidate list excludes that group. Hosts per THIRD_SLOTS order:
  const hostGroup: Record<string, GroupId> = {
    M74: 'E', M77: 'I', M79: 'A', M80: 'L', M81: 'D', M82: 'G', M85: 'B', M87: 'K',
  };
  for (const slot of THIRD_SLOTS) {
    assert.ok(
      !slot.candidates.includes(hostGroup[slot.match]),
      `${slot.match} candidates must exclude host group ${hostGroup[slot.match]}`,
    );
  }
});

// ── Third-place assignment: all 495 combinations resolve ─────────────────────
function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  const [head, ...rest] = arr;
  return [
    ...combinations(rest, k - 1).map((c) => [head, ...c]),
    ...combinations(rest, k),
  ];
}

test('all C(12,8)=495 third-place combinations yield a valid bijective assignment', () => {
  const combos = combinations(GROUP_IDS, 8);
  assert.equal(combos.length, 495);
  for (const combo of combos) {
    const assignment = assignThirdPlaceSlots(combo);
    const assignedGroups = Object.values(assignment);
    const assignedSlots = Object.keys(assignment);
    // bijection: 8 slots, 8 distinct groups, exactly the input set
    assert.equal(assignedSlots.length, 8, `combo ${combo.join('')}`);
    assert.equal(new Set(assignedGroups).size, 8, `combo ${combo.join('')} distinct`);
    assert.deepEqual([...assignedGroups].sort(), [...combo].sort());
    // each group landed in a slot that lists it as a candidate
    for (const slot of THIRD_SLOTS) {
      assert.ok(
        slot.candidates.includes(assignment[slot.match]),
        `combo ${combo.join('')}: ${assignment[slot.match]} not eligible for ${slot.match}`,
      );
    }
  }
});

test('third-place assignment is deterministic', () => {
  const combo: GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  assert.deepEqual(assignThirdPlaceSlots(combo), assignThirdPlaceSlots([...combo].reverse()));
});

test('assignThirdPlaceSlots rejects wrong-sized input', () => {
  assert.throws(() => assignThirdPlaceSlots(['A', 'B'] as GroupId[]));
});

// ── buildKnockoutTree ────────────────────────────────────────────────────────
// Helper: seeded standings = drawn order (pos1 winner … pos4 last) per group.
function seededStandings(): Record<GroupId, [string, string, string, string]> {
  const out = {} as Record<GroupId, [string, string, string, string]>;
  for (const g of GROUP_IDS) {
    const teams = TEAMS.filter((t) => t.group === g).map((t) => t.code);
    out[g] = [teams[0], teams[1], teams[2], teams[3]];
  }
  return out;
}

const SAMPLE_THIRDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as GroupId[];

function sampleTree(): KnockoutTree {
  const standings = seededStandings();
  const thirds = SAMPLE_THIRDS.map((g) => standings[g][2]); // 3rd-placed of each
  return buildKnockoutTree(standings, thirds);
}

test('tree has the right number of matches per round', () => {
  const tree = sampleTree();
  assert.equal(tree.r32.length, 16);
  assert.equal(tree.r16.length, 8);
  assert.equal(tree.qf.length, 4);
  assert.equal(tree.sf.length, 2);
  assert.equal(tree.final, 'M104');
  assert.equal(Object.keys(tree.matches).length, 31);
});

test('R32 matches are fully resolved to concrete teams', () => {
  const tree = sampleTree();
  for (const id of tree.r32) {
    const m = tree.matches[id];
    assert.ok(m.home, `${id} home resolved`);
    assert.ok(m.away, `${id} away resolved`);
  }
});

test('R32 known fixed slots resolve correctly', () => {
  const standings = seededStandings();
  const tree = sampleTree();
  // M73 = 2A v 2B
  assert.equal(tree.matches['M73'].home, standings['A'][1]);
  assert.equal(tree.matches['M73'].away, standings['B'][1]);
  // M84 = 1H v 2J
  assert.equal(tree.matches['M84'].home, standings['H'][0]);
  assert.equal(tree.matches['M84'].away, standings['J'][1]);
  // M79 = 1A v (a third place team)
  assert.equal(tree.matches['M79'].home, standings['A'][0]);
});

test('no R32 match pits a team against an opponent from its own group', () => {
  const tree = sampleTree();
  for (const id of tree.r32) {
    const m = tree.matches[id];
    const hg = TEAMS.find((t) => t.code === m.home)!.group;
    const ag = TEAMS.find((t) => t.code === m.away)!.group;
    assert.notEqual(hg, ag, `${id}: ${m.home}(${hg}) vs ${m.away}(${ag})`);
  }
});

test('Spain (group H winner) and Argentina (group J winner) are in opposite halves', () => {
  // Walk feedsInto from each group winner's R32 match up to the semifinal.
  const tree = sampleTree();
  function semifinalOf(r32Id: string): string {
    let id = r32Id;
    while (tree.matches[id].round !== 'sf') {
      id = tree.matches[id].feedsInto!;
    }
    return id;
  }
  // Spain is 1H → M84; Argentina is 1J → M86.
  const espSF = semifinalOf('M84');
  const argSF = semifinalOf('M86');
  assert.notEqual(espSF, argSF, 'Spain and Argentina must only be able to meet in the final');
});

test('every non-final match feeds into exactly one parent slot', () => {
  const tree = sampleTree();
  for (const id of Object.keys(tree.matches)) {
    if (id === tree.final) {
      assert.equal(tree.matches[id].feedsInto, null);
    } else {
      assert.ok(tree.matches[id].feedsInto, `${id} feedsInto`);
      assert.ok(tree.matches[id].feedsSlot, `${id} feedsSlot`);
    }
  }
});

test('buildKnockoutTree rejects a non-3rd-placed qualifier', () => {
  const standings = seededStandings();
  const bad = SAMPLE_THIRDS.map((g) => standings[g][2]);
  bad[0] = standings['A'][0]; // group winner, not 3rd
  assert.throws(() => buildKnockoutTree(standings, bad));
});

test('buildKnockoutTree rejects wrong number of qualifiers', () => {
  const standings = seededStandings();
  assert.throws(() => buildKnockoutTree(standings, ['MEX']));
});

// ── applyWinners propagation + invalidation ──────────────────────────────────
test('winners propagate up the tree', () => {
  const tree = sampleTree();
  const m73 = tree.matches['M73'];
  const winners: Record<string, string> = { M73: m73.home! };
  const { tree: t2, winners: cleaned } = applyWinners(tree, winners);
  assert.equal(cleaned['M73'], m73.home);
  // M73 feeds M90 home.
  assert.equal(t2.matches['M90'].home, m73.home);
});

test('an invalid winner pick is dropped', () => {
  const tree = sampleTree();
  const { winners: cleaned } = applyWinners(tree, { M73: 'NOT_A_TEAM' });
  assert.equal(cleaned['M73'], undefined);
});

test('downstream picks invalidate when an upstream slot is empty', () => {
  const tree = sampleTree();
  // Pick a winner two rounds down without the feeding match resolved.
  const { tree: t2, winners: cleaned } = applyWinners(tree, { M97: tree.matches['M73'].home! });
  // M97 home/away are null (no R16 winners), so the pick can't be valid.
  assert.equal(cleaned['M97'], undefined);
  assert.equal(t2.matches['M101'].home, null);
});

test('a full champion path resolves end to end', () => {
  let tree = sampleTree();
  const winners: Record<string, string> = {};
  // Always advance the home participant; iterate rounds so slots fill first.
  const rounds = [tree.r32, tree.r16, tree.qf, tree.sf, [tree.final]];
  for (const round of rounds) {
    for (const id of round) {
      const m = tree.matches[id];
      if (m.home) winners[id] = m.home;
    }
    tree = applyWinners(tree, winners).tree;
  }
  const champion = winners[tree.final];
  assert.ok(champion, 'final has a winner');
  assert.equal(tree.matches[tree.final].home, champion);
});
