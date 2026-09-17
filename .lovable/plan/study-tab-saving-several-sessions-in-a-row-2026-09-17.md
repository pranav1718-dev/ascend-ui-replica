# Study tab: saving several sessions in a row

## Root cause

When you tap "Save & add another", the form clears **every** box — including the subject
and the date. If you then only type the next topic (WAN) and save, the subject is empty,
so the app refuses the save with "Pick a subject or type one." The first session is
stored, the second silently isn't. That is the bug you are seeing.

Two smaller contributors found while checking:

- The duplicate-tap protection identifies a save by subject + topic only. Two sessions
  that share a subject and have no topic are treated as the same save, so the second can
  be dropped without any message.
- Sessions added for a future day with no start time all get the same midnight time, so
  their order in the list is arbitrary.

## Fix

1. Keep the subject, date and start time filled in after "Save & add another"; clear only
   topic and planned minutes. The sheet still shows "Saved — add another", so you can
   type WAN and save straight away.
2. Make each save identified uniquely (subject + topic + chosen start moment), so two
   saves are never mistaken for one.
3. Give sessions on a future day a slightly increasing time so they list in the order you
   added them.
4. If a save is ever rejected as a duplicate, show that in the sheet instead of a false
   "Saved".

No visual changes: same sheet, same colours, spacing, buttons and navigation. No database
or schema changes. Date selection, filtering and Undo stay exactly as they are.

## Technical notes

- `src/components/common/SheetDialog.tsx`: add an optional `sticky?: boolean` on
  `SheetField`; `run(keepOpen)` resets only non-sticky fields.
- `src/routes/_authenticated/study.tsx`: mark `subject_id`, `subject`, `date`, `time`
  sticky; when no time is given for a non-today date, offset `started_at` by the number of
  sessions already saved that day.
- `src/hooks/use-ascend.ts`: include `started_at` in the `useInFlight` key for
  `createSession`; throw a clear error when the guard swallows a call.
- Verify with `bunx tsgo --noEmit` and `bun run lint`.
