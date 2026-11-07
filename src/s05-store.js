// Section 05 — State as a state machine
//
// The whole app's state is ONE object. It only ever changes through
// transition(state, event), which returns a NEW state (or the SAME state
// when the event changes nothing). Never change `state` itself.

export const initialState = Object.freeze({
  status: "idle",       // "idle" | "loading" | "ready" | "error"
  courses: [],          // the courses from the last successful load
  error: null,          // the error message when status is "error"
  departments: [],      // every department name, sorted — filled by the first successful load
  department: "",       // the selected department filter ("" = all)
  query: "",            // the search box text
  planner: [],          // planned courses: { id, code, title, credits }
  grades: {},           // the SGPA calculator form: { [courseId]: "A" | "A-" | … }
});

export function transition(state, event) {
  switch (event.type) {
    case "LOAD_START":
      // status becomes "loading" and error becomes null; everything else stays
      return { ...state, status: "loading", error: null };
    case "LOAD_OK":
      // status "ready", courses from event.courses; on the FIRST success also
      // fill departments (unique, sorted) from those courses
      const departments = state.departments.length === 0 ? 
      [...new Set(event.courses.map(courses => courses.department))].sort() : state.departments;
      return {...state,status: "ready", courses: event.courses, departments: departments};

    case "LOAD_FAIL":
      // status "error", error from event.message (keep the old courses)
      return {...state, status: "error", error: event.message};


    case "SET_DEPARTMENT":
      // department from event.department — the SAME state if it didn't change
      if(state.department === event.department) {
        return state;
      }
      return {...state, department: event.department};

    case "SET_QUERY":
      // query from event.query — the SAME state if it didn't change
      if(state.query === event.query) {
        return state;
      }

      return {...state, query: event.query};


      case "ADD":
      // add { id, code, title, credits } of event.course to the planner —
      // the SAME state if it's already there.
      // Stretch: also refuse a full course, or one that would go over 24 credits.
      const course = event.course;
      const alreadyExists = state.planner.some(c => c.id === course.id);
      const totalCredits = state.planner.reduce(
        (sum, item) => sum + item.credits,
        0
    );

    if (alreadyExists || course.full || totalCredits + course.credits > 24) {
        return state;
    }

    const newCourse = {
        id: course.id,
        code: course.code,
        title: course.title,
        credits: course.credits
    };

    return {
        ...state,
        planner: [...state.planner, newCourse]
    };


    case "REMOVE":
      // remove the course with id event.id, AND its grade if it has one —
      // the SAME state if it isn't in the planner
      const exists = state.planner.some(c => c.id === event.id);
        course => course.id === event.id;
      if (!exists) {
        return state;
      }
      const planner = state.planner.filter(course => course.id !== event.id);
      const {[event.id]: removeGrade, ...grades} = state.grades;
      return {
        ...state,
        planner: planner,
        grades: grades
      };


    case "SET_GRADE":
      // grades[event.id] = event.grade (a computed key!); an empty grade ""
      // removes that course's entry — the SAME state if nothing changes
      const { id, grade } = event;

    if (grade === "") {
        if (!(id in state.grades)) {
            return state;
        }

        const { [id]: removedGrade, ...grades } = state.grades;

        return {
            ...state,
            grades
        };
    }

    if (state.grades[id] === grade) {
        return state;
    }

    return {
        ...state,
        grades: {
            ...state.grades,
            [id]: grade
        }
      }

      default:
      return state; // an event we don't know changes nothing
  }
}
