/**
 * program: "patienceDiff" algorithm implemented in typescript.
 **/

interface Line {
  line?: string;
  aIndex?: number;
  bIndex?: number;
  moved?: boolean;
}

interface Lines extends Array<Line> {}

interface DiffResult {
  lines: Lines;
  lineCountDeleted: number;
  lineCountInserted: number;
  lineCountMoved: number;
  aMove?: string[];
  aMoveIndex?: number[];
  bMove?: string[];
  bMoveIndex?: number[];
}

interface UniqueLine {
  indexA: number;
  indexB: number;
  prev?: UniqueLine;
}

/**
 * Finds the unique lines in the given array range and returns a Map
 * with the unique lines as keys and their indexes as values.
 * Removes any duplicate line, which helps prepare for longest common subsequence.
 */
export function findUnique(
  arr: string[],
  lo: number,
  hi: number
): Map<string, number> {
  const lineMap = new Map();

  for (let i = lo; i <= hi; i++) {
    const line = arr[i];

    if (lineMap.has(line)) {
      lineMap.get(line)!.count++;
      lineMap.get(line)!.index = i;
    } else {
      lineMap.set(line, {
        count: 1,
        index: i,
      });
    }
  }

  lineMap.forEach((val, key, map) => {
    if (val.count !== 1) {
      map.delete(key);
    } else {
      map.set(key, val.index);
    }
  });

  return lineMap;
}

/**
 * Finds the unique common lines between two ranges of lines.
 * Calls findUnique on each range to get unique lines.
 * Compares the two sets of unique lines.
 * Returns map with common lines as keys and their indexes in each array as values.
 * The map key is the common line string.
 * The map value is an object containing the indexes of that line in each original array.
 */
export function findUniqueCommon(
  orginalLines: string[],
  aLo: number,
  aHi: number,
  newLines: string[],
  bLo: number,
  bHi: number
): Map<string, UniqueLine> {
  const originalUnique = findUnique(orginalLines, aLo, aHi);
  const newUnique = findUnique(newLines, bLo, bHi);
  const uniqueCommon: Map<string, UniqueLine> = new Map();
  console.log("CALLING FIND UNIQUE COMMON");
  console.log("ORIG", originalUnique);
  console.log("NEW", newUnique);
  console.log("LET's ITERATE OVER ORIG");
  originalUnique.forEach((val, key) => {
    console.log(key, val);
    if (newUnique.has(key)) {
      console.log("FOUND", key);
      uniqueCommon.set(key, {
        indexA: val,
        indexB: newUnique.get(key) as number,
      });
      console.dir(uniqueCommon);
    } else {
      console.log("NOT FOUND", key);
      console.log("DELETING");
      uniqueCommon.delete(key);
      console.log(uniqueCommon);
    }
  });
  console.log("COMMON", uniqueCommon);
  return uniqueCommon;
}

// longestCommonSubsequence takes a Map from uniqueCommon
// and finds the longest common subsequence of matching lines between the original
// and new line arrays.

// It returns an ordered array of objects containing the original and new
// array indexes for each line in the longest common subsequence.

export function longestCommonSubsequence(
  abMap: Map<string, UniqueLine>
): UniqueLine[] {
  const ja: Array<UniqueLine[]> = [];

  // First, walk the list creating the jagged array.

  abMap.forEach((val: UniqueLine) => {
    let i = 0;

    while (ja[i] && ja[i][ja[i].length - 1].indexB < val.indexB) {
      i++;
    }

    if (!ja[i]) {
      ja[i] = [];
    }

    if (0 < i) {
      const prev = ja[i - 1][ja[i - 1].length - 1];
      if (prev) {
        val.prev = prev;
      }
    }

    ja[i].push(val);
  });

  // Now, pull out the longest common subsequence.

  let lcs: UniqueLine[] = [];

  if (0 < ja.length) {
    const n = ja.length - 1;
    lcs = [ja[n][ja[n].length - 1]];

    while (lcs[lcs.length - 1].prev) {
      lcs.push(lcs[lcs.length - 1].prev!);
    }
  }

  return lcs.reverse();
}

/**
 *
 /**
 * Use: patienceDiff(originalTextLines, newTextLines, diffPlusFlag) 
 * 
 * Where:
 * - originalTextLines[] contains the original text lines
 * - newTextLines[] contains the new text lines
 * - diffPlusFlag if true, returns additional arrays with the subset of lines that were deleted or inserted.  
 *   These additional arrays are used by patienceDiffPlus.
 * 
 * Returns an object with the following properties:
 * - lines[] with properties of: 
 *   - line containing the line of text from originalTextLines or newTextLines
 *   - aIndex referencing the index in originalTextLines[] 
 *   - bIndex referencing the index in newTextLines[]
 *     (Note: The line is text from either originalTextLines or newTextLines, with aIndex and bIndex referencing the original index. 
 *      If aIndex === -1 then the line is new from newTextLines, and if bIndex === -1 then the line is old from originalTextLines.)
 * - lineCountDeleted is the number of lines from originalTextLines[] not appearing in newTextLines[]
 * - lineCountInserted is the number of lines from newTextLines[] not appearing in originalTextLines[]
 * - lineCountMoved is 0. (Only set when using patienceDiffPlus.)
*/

export function patienceDiff(
  origTextLines: string[],
  newTextLines: string[],
  diffPlusFlag?: boolean
): DiffResult {
  // The "result" array accumulates the following:
  // - Lines from origTextLines that were deleted (not in newTextLines)
  // - Lines shared between origTextLines and newTextLines
  // - Lines from newTextLines that were inserted (not in origTextLines)

  const result: Lines = [];
  let deleted = 0;
  let inserted = 0;

  // aMove and bMove will contain the lines that don't match, and will be returned
  // The following arrays are for searching lines that were moved.

  const aMove: string[] = [];
  const aMoveIndex: number[] = [];
  const bMove: string[] = [];
  const bMoveIndex: number[] = [];

  /**
   * addToResult adds a line to the result array.
   * It checks if the line is from the original text (aIndex >= 0) or new text (bIndex >= 0).
   * Lines only in the original text are added to the aMove arrays.
   * Lines only in the new text are added to the bMove arrays.
   * The line, along with original and new index, is added to the result array.
   */
  function addToResult(aIndex: number, bIndex: number) {
    if (bIndex < 0) {
      aMove.push(origTextLines[aIndex]);
      aMoveIndex.push(result.length);
      deleted++;
    } else if (aIndex < 0) {
      bMove.push(newTextLines[bIndex]);
      bMoveIndex.push(result.length);
      inserted++;
    }

    result.push({
      line: 0 <= aIndex ? origTextLines[aIndex] : newTextLines[bIndex],
      aIndex: aIndex,
      bIndex: bIndex,
    });
  }

  // addSubMatch handles the lines between a pair of entries in the longest common subsequence (LCS).
  // So this function might recursively call recurseLCS to further match the lines
  // between origTextLines and newTextLines that are between entries in the LCS.

  function addSubMatch(aLo: number, aHi: number, bLo: number, bHi: number) {
    // Match any lines at the start of origTextLines and newTextLines.

    while (
      aLo <= aHi &&
      bLo <= bHi &&
      origTextLines[aLo] === newTextLines[bLo]
    ) {
      addToResult(aLo++, bLo++);
    }

    // First, match any identical lines at the start of origTextLines and newTextLines
    // but don't add them to the result yet. We need to analyze the lines in between first.

    // Next, match any identical lines at the end of origTextLines and newTextLines,
    // but again don't add them to the result yet. We need to look at the lines in between first.

    const aHiTemp = aHi;

    while (
      aLo <= aHi &&
      bLo <= bHi &&
      origTextLines[aHi] === newTextLines[bHi]
    ) {
      aHi--;
      bHi--;
    }

    // Check the remaining lines in the subsequence to see if there are any identical lines
    // between origTextLines and newTextLines.

    // If there are no identical lines, add the entire subsequence to the result
    // (with all origTextLines deleted and all newTextLines inserted).

    // If there are identical lines between origTextLines and newTextLines, recursively
    // perform the patience diff algorithm on the subsequence to further match the lines.

    const uniqueCommonMap = findUniqueCommon(
      origTextLines,
      aLo,
      aHi,
      newTextLines,
      bLo,
      bHi
    );

    if (uniqueCommonMap.size === 0) {
      while (aLo <= aHi) {
        addToResult(aLo++, -1);
      }

      while (bLo <= bHi) {
        addToResult(-1, bLo++);
      }
    } else {
      recurseLCS(aLo, aHi, bLo, bHi, uniqueCommonMap);
    }

    // Add the matching lines at the end to the result

    while (aHi < aHiTemp) {
      addToResult(++aHi, ++bHi);
    }
  }

  //
  // The recurseLCS function recursively finds the longest common subsequence (LCS)
  // between slices of the origTextLines and newTextLines arrays.

  // It does this by:

  // 1. Finding the LCS between origTextLines[aLo..aHi] and newTextLines[bLo..bHi].

  // 2. If the LCS is empty, adding the entire subsequence to the result.

  // 3. If the LCS is not empty, recursively calling recurseLCS on slices of the
  //    origTextLines and newTextLines arrays before and after each match in the LCS.

  // 4. Once there are no more LCS matches in a slice, adding that remaining slice
  //    to the result.

  // This has the effect of recursively finding all the matching subsequences
  // between origTextLines and newTextLines, interspersed with non-matching slices.

  function recurseLCS(
    aLo: number,
    aHi: number,
    bLo: number,
    bHi: number,
    uniqueCommonMap?: Map<string, UniqueLine>
  ) {
    console.log("recurseLCS on", uniqueCommonMap);
    if (!uniqueCommonMap) {
      console.log("Calling recurseLCS from recurseLCS");
    }
    console.log("recurseLCS on", aLo, aHi, bLo, bHi);
    const x = longestCommonSubsequence(
      uniqueCommonMap ||
        findUniqueCommon(origTextLines, aLo, aHi, newTextLines, bLo, bHi)
    );

    if (x.length === 0) {
      addSubMatch(aLo, aHi, bLo, bHi);
    } else {
      if (aLo < x[0].indexA || bLo < x[0].indexB) {
        addSubMatch(aLo, x[0].indexA - 1, bLo, x[0].indexB - 1);
      }

      let i;
      for (i = 0; i < x.length - 1; i++) {
        addSubMatch(
          x[i].indexA,
          x[i + 1].indexA - 1,
          x[i].indexB,
          x[i + 1].indexB - 1
        );
      }

      if (x[i].indexA <= aHi || x[i].indexB <= bHi) {
        addSubMatch(x[i].indexA, aHi, x[i].indexB, bHi);
      }
    }
  }

  recurseLCS(0, origTextLines.length - 1, 0, newTextLines.length - 1);

  if (diffPlusFlag) {
    return {
      lines: result,
      lineCountDeleted: deleted,
      lineCountInserted: inserted,
      lineCountMoved: 0,
      aMove: aMove,
      aMoveIndex: aMoveIndex,
      bMove: bMove,
      bMoveIndex: bMoveIndex,
    };
  }

  return {
    lines: result,
    lineCountDeleted: deleted,
    lineCountInserted: inserted,
    lineCountMoved: 0,
  };
}

/**
 * Patience diff plus algorithm implemented in TypeScript
 * Performs an enhanced patience diff between two arrays of text lines.
 * Recursively finds moved blocks in addition to inserts, deletes and matches.
 *
 * @param origTextLines - The original array of text lines
 * @param newTextLines - The new array of text lines
 * @returns A diff result object containing the aligned lines,
 *   line counts of inserts/deletes/moves, and indices mapping moved lines:
 *  - lines[] with properties:
 *   - line: the text line from originalTextLines or newTextLines
 *   - aIndex: index in originalTextLines[]
 *   - bIndex: index in newTextLines[]
 *     (Note: The line is from either originalTextLines or newTextLines.
 *      aIndex refers to index in originalTextLines[].
 *      If aIndex === -1, the line is new from newTextLines[].
 *      bIndex refers to index in newTextLines[].
 *      If bIndex === -1, the line is old from originalTextLines[].)
 *   - moved: true if the line was moved from elsewhere in originalTextLines[] or newTextLines[]
 * - lineCountDeleted: number of lines from originalTextLines[] not in newTextLines[]
 * - lineCountInserted: number of lines from newTextLines[] not in originalTextLines[]
 * - lineCountMoved: number of moved lines
 */

export function patienceDiffPlus(
  origTextLines: string[],
  newTextLines: string[]
) {
  const difference = patienceDiff(origTextLines, newTextLines, true);
  console.log("difference", difference);

  let aMoveNext = difference.aMove;
  let aMoveIndexNext = difference.aMoveIndex;
  let bMoveNext = difference.bMove;
  let bMoveIndexNext = difference.bMoveIndex;

  delete difference.aMove;
  delete difference.aMoveIndex;
  delete difference.bMove;
  delete difference.bMoveIndex;

  let lastLineCountMoved;

  do {
    const aMove = aMoveNext;
    const aMoveIndex = aMoveIndexNext;
    const bMove = bMoveNext;
    const bMoveIndex = bMoveIndexNext;

    aMoveNext = [];
    aMoveIndexNext = [];
    bMoveNext = [];
    bMoveIndexNext = [];

    const subDiff = patienceDiff(aMove || [], bMove || []);

    lastLineCountMoved = difference.lineCountMoved;

    subDiff.lines.forEach((v) => {
      if (
        v.aIndex != undefined &&
        v.bIndex != undefined &&
        aMoveIndex != undefined &&
        bMoveIndex != undefined &&
        0 <= v.aIndex &&
        0 <= v.bIndex
      ) {
        difference.lines[aMoveIndex[v.aIndex]].moved = true;
        difference.lines[bMoveIndex[v.bIndex]].aIndex = aMoveIndex[v.aIndex];
        difference.lines[bMoveIndex[v.bIndex]].moved = true;
        difference.lineCountInserted--;
        difference.lineCountDeleted--;
        difference.lineCountMoved++;
      } else if (
        v.aIndex &&
        v.bIndex &&
        aMoveIndexNext &&
        aMoveIndex &&
        aMoveNext &&
        aMove &&
        v.bIndex < 0
      ) {
        aMoveNext.push(aMove[v.aIndex]);
        aMoveIndexNext.push(aMoveIndex[v.aIndex]);
      } else if (
        bMoveIndex &&
        bMoveIndexNext &&
        bMoveNext &&
        bMove &&
        v.bIndex
      ) {
        bMoveNext.push(bMove[v.bIndex]);
        bMoveIndexNext.push(bMoveIndex[v.bIndex]);
      }
    });
  } while (0 < difference.lineCountMoved - lastLineCountMoved);

  return difference;
}
