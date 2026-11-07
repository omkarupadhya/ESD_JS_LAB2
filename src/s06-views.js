// Section 06 — From state to screen: views
// Pure functions: state in, plain data describing the screen out. No DOM here.
// Nothing they return is ever stored in state — it's worked out fresh on every render.

// What one course card shows.
//   { id, heading, meta, seats, inPlanner, buttonLabel, disabled }
//   heading      "CS402 · Enterprise Software Development"
//   meta         "4 credits · Computer Science"
//   seats        "Full" | "1 seat left" | "12 seats left"
//   inPlanner    is this course already in the planner?
//   buttonLabel  "Remove" if in the planner, otherwise "Add"
//   disabled     true only for a FULL course that is NOT in the planner
export function cardView(course, planner) {
    const inPlanner = planner.some(
        item => item.id === course.id
    );

    let seats;

    if (course.seatsLeft === 0) {
        seats = "Full";
    } else if (course.seatsLeft === 1) {
        seats = "1 seat left";
    } else {
        seats = `${course.seatsLeft} seats left`;
    }

    return {
        id: course.id,
        heading: `${course.code} · ${course.title}`,
        meta: `${course.credits} credits · ${course.department}`,
        seats,
        inPlanner,
        buttonLabel: inPlanner ? "Remove" : "Add",
        disabled: course.seatsLeft === 0 && !inPlanner
    };
}

// The planner summary.
//   { count, credits, overLimit, text }
//   text: "Nothing planned yet" | "1 course · 4 credits" | "3 courses · 10 credits"
//   overLimit: credits > 24
export function summaryView(planner) {
  const count = planner.length;
  const credits = planner.reduce((sum,course) => sum + course.credits, 0);
  const overLimit = credits > 24;
  let text;
  if (count === 0) {
    text = "Nothing planned yet";
  }else{
    text = `${count} course${count > 1 ? "s" : ""} · ${credits} credit${credits > 1 ? "s" : ""}`;

  }
  return {
    count,credits,overLimit,text
  };

}

// The status line above the list.
//   { message, showRetry }
//   loading → "Loading courses…"
//   error   → `Couldn't load courses: ${state.error}`, with showRetry true
//   ready with no courses → "No courses match."
//   anything else → ""  (showRetry false except for errors)
export function statusView(state) {
  if(state.status==="loading") {
    return {message: "Loading courses…", showRetry: false};
  }
  if(state.status==="error") {
    return {message: `Couldn't load courses: ${state.error}`, showRetry: true};
  } 
  if(state.status==="ready" && state.courses.length===0) {
    return {message: "No courses match.", showRetry: false};
  }
  return {message: "", showRetry: false};
}

// The SGPA calculator.
// Grade points on a 10-point scale:
export const GRADE_POINTS = Object.freeze({ A: 10, "A-": 9, B: 8, "B-": 7, C: 6, D: 5, F: 0 });

// SGPA = sum(credits × points) / sum(credits), over the planned courses that HAVE a grade.
//   { graded, total, credits, sgpa, text }
//   graded   how many planned courses have a grade
//   total    how many courses are planned
//   credits  the credits of the graded courses
//   sgpa     a number rounded to 2 decimals, or null when nothing is graded
//   text     "Add courses to the planner first"           (nothing planned)
//            "Pick a grade to see your SGPA"              (planned, none graded)
//            "SGPA 8.40 · 3 of 4 courses graded"           (some graded)
//            "SGPA 8.40"                                   (all graded)
//   (sgpa in text always shows 2 decimals: 9 → "9.00")
    

export function sgpaView(planner, grades) {
   let graded = 0;
    let credits = 0;
    let weightedPoints = 0;

    for (const course of planner) {
        const grade = grades[course.id];

        if (!grade || !Object.hasOwn(GRADE_POINTS, grade)) {
            continue;
        }

        graded++;
        credits += course.credits;
        weightedPoints += course.credits * GRADE_POINTS[grade];
    }

    const total = planner.length;

    const sgpa = graded === 0
        ? null
        : Math.round((weightedPoints / credits) * 100) / 100;

    let text;

    if (total === 0) {
        text = "Add courses to the planner first";
    } else if (graded === 0) {
        text = "Pick a grade to see your SGPA";
    } else if (graded < total) {
        text = `SGPA ${sgpa.toFixed(2)} · ${graded} of ${total} courses graded`;
    } else {
        text = `SGPA ${sgpa.toFixed(2)}`;
    }

    return {
        graded,
        total,
        credits,
        sgpa,
        text
    };
}
