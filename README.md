# Patience Diff

This is an implementation of the patience diff algorithm in TypeScript. It compares two arrays of text lines and produces a diff result showing the differences.

## Features

- Finds inserted, deleted, and matched lines between two arrays of text
- Recursively finds the longest common subsequence (LCS) between slices of the input arrays
- Handles interleaved changes by recursively finding LCS matches within unmatched regions
- `patienceDiff` function provides basic diff with inserts, deletes and matches
- `patienceDiffPlus` enhances it to also detect moved blocks of lines

## Usage

Import the functions from the `patienceDiff.ts` file:

```
import { patienceDiff, patienceDiffPlus } from './patienceDiff';

```

Call `patienceDiff` to get a basic diff:

```
const diff = patienceDiff(originalLines, newLines);

```

Call `patienceDiffPlus` to also detect moved blocks:

```
const diff = patienceDiffPlus(originalLines, newLines);

```

The diff result object contains:

- `lines` array - the aligned lines from the input arrays
- `lineCountDeleted` - count of deleted lines
- `lineCountInserted` - count of inserted lines
- `lineCountMoved` - count of moved lines (only from `patienceDiffPlus`)
- Indices mapping moved lines (only from `patienceDiffPlus`)

## Algorithm

The patience diff algorithm works as follows:

1.  Find the longest common subsequence (LCS) between the two input arrays
2.  Recursively diff any lines before/after LCS matches
3.  Repeat process on unmatched regions to find all LCS matches
4.  Lines not part of any LCS are considered inserts or deletes

The `patienceDiffPlus` enhancement further analyzes lines not part of the LCS to detect moved blocks.

## Credits

This implementation is based on the prior art of Jon Trent and the paper "An O(ND) Difference Algorithm and its Variations" by Eugene W. Myers
