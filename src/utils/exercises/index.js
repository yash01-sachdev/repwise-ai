import { analyzeSquat, resetRepFlags } from "./squat";
import { analyzePushup, resetPushupFlags } from "./pushup";
import { analyzeBicepCurl, resetCurlFlags } from "./bicepCurl";
import { analyzeDeadlift, resetDeadliftFlags } from "./deadlift";
import { analyzeOverheadPress, resetOverheadPressFlags } from "./overheadPress";

export const EXERCISES = {
  squat: {
    id: "squat",
    name: "Squat",
    icon: "SQ",
    desc: "Tracks knee angle, back lean, depth",
    camera: "Side view · Hip height · 3-4 feet away",
    analyze: analyzeSquat,
    resetFlags: resetRepFlags,
  },
  pushup: {
    id: "pushup",
    name: "Push-up",
    icon: "PU",
    desc: "Tracks elbow angle, hip sag",
    camera: "Front view · Place phone above you",
    analyze: analyzePushup,
    resetFlags: resetPushupFlags,
  },
  bicepCurl: {
    id: "bicepCurl",
    name: "Bicep Curl",
    icon: "BC",
    desc: "Tracks elbow angle, eccentric control",
    camera: "Side view · Hip height · 3-4 feet away",
    analyze: analyzeBicepCurl,
    resetFlags: resetCurlFlags,
  },
  deadlift: {
    id: "deadlift",
    name: "Deadlift",
    icon: "🏋️",
    desc: "Tracks hip hinge, lockout, torso position",
    camera: "Side view - hip height - full body visible",
    analyze: analyzeDeadlift,
    resetFlags: resetDeadliftFlags,
  },
  overheadPress: {
    id: "overheadPress",
    name: "Overhead Press",
    icon: "🔼",
    desc: "Tracks elbow extension, lockout, torso position",
    camera: "Side view - hip height - upper body fully visible",
    analyze: analyzeOverheadPress,
    resetFlags: resetOverheadPressFlags,
  },

  
};
