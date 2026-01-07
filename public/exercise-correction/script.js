const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const feedbackDiv = document.getElementById('feedback');

// Rep counting variables
let repCount = 0;
let inDownPosition = false;
let lastExerciseState = '';
let validExerciseState = false;
let lastValidExercise = ''; 

let exerciseStates = {
  'Squat': { down: false, threshold: 100 },
  'Push-up': { down: false, threshold: 110 },
  'Bicep Curl': { down: false, threshold: 90 },
  'Plank': { timer: 0, isHolding: false },
  'Lunge': { down: false, threshold: 110 }
};

// Helper: Calculate angle between three points
function getAngle(a, b, c) {
  const ab = {x: b.x - a.x, y: b.y - a.y};
  const cb = {x: b.x - c.x, y: b.y - c.y};
  const dot = ab.x * cb.x + ab.y * cb.y;
  const abLen = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  const cbLen = Math.sqrt(cb.x * cb.x + cb.y * cb.y);
  const angle = Math.acos(dot / (abLen * cbLen));
  return angle * (180 / Math.PI);
}

// Reset rep counter when changing exercises
function resetRepCounter() {
  repCount = 0;
  inDownPosition = false;
  lastExerciseState = '';
  validExerciseState = false;
  lastValidExercise = '';
  
  // Reset exercise states
  exerciseStates = {
    'Squat': { down: false, threshold: 100 },
    'Push-up': { down: false, threshold: 110 },
    'Bicep Curl': { down: false, threshold: 90 },
    'Plank': { timer: 0, isHolding: false },
    'Lunge': { down: false, threshold: 110 }
  };
  
  // Update the UI display
  const repCountDisplay = document.getElementById('repCountDisplay');
  if (repCountDisplay) {
    repCountDisplay.innerText = '0';
  }
  
  console.log("Rep counter reset");
}

// Calculate distance between two points
function getDistance(a, b) {
  if (!a || !b) return 0;
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

// Debug and control
let debugMode = false;
let activeExerciseMode = null; // Can be set to focus on specific exercise

function toggleDebug() {
  debugMode = !debugMode;
  console.log("Debug mode:", debugMode);
}

  // Keyboard controls
document.addEventListener('keydown', (e) => {
  // Debug mode toggle
  if (e.key === 'd' || e.key === 'D') {
    toggleDebug();
  }
  
  // Exercise focus modes
  if (e.key === '1') {
    activeExerciseMode = 'Squat';
    exerciseConfidence = 0; // Reset confidence
    console.log("Focused on: Squat detection only");
    alert("Now focusing on SQUAT detection only");
  } else if (e.key === '2') {
    activeExerciseMode = 'Push-up';
    exerciseConfidence = 0; // Reset confidence
    console.log("Focused on: Push-up detection only");
    alert("Now focusing on PUSH-UP detection only");
  } else if (e.key === '3') {
    activeExerciseMode = 'Bicep Curl';
    exerciseConfidence = 0; // Reset confidence
    console.log("Focused on: Bicep Curl detection only");
    alert("Now focusing on BICEP CURL detection only");
  } else if (e.key === '4') {
    activeExerciseMode = 'Plank';
    exerciseConfidence = 0; // Reset confidence
    console.log("Focused on: Plank detection only");
    alert("Now focusing on PLANK detection only");
  } else if (e.key === '0') {
    activeExerciseMode = null;
    exerciseConfidence = 0; // Reset confidence
    console.log("Detecting all exercises");
    alert("Now detecting ALL exercises");
  }
});// Store previous states for smoother transitions
let prevExercise = '';
let exerciseConfidence = 0;
const CONFIDENCE_THRESHOLD = 2; // Reduced threshold for easier detection
let lastDetectionTime = Date.now();

// Helper to check if a point is significantly higher than another
function isHigherThan(a, b, threshold = 0.1) {
  return b && a && (b.y - a.y) > threshold;
}

// Rule-based exercise classification and posture check
function classifyExercise(landmarks) {
  if (!landmarks) return {exercise: 'No Person', correct: false, details: '', reps: 0};
  
  // Remove visibility check that might be too strict
  // We'll rely on the presence of landmarks instead
  
  // Key points
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const nose = landmarks[0];
  const leftEye = landmarks[2];
  const rightEye = landmarks[5];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftHeel = landmarks[29];
  const rightHeel = landmarks[30];
  const leftFoot = landmarks[31]; 
  const rightFoot = landmarks[32];
  
  // Reset valid exercise state for this frame
  validExerciseState = false;

  if ([leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle, leftShoulder, rightShoulder].some(l => !l)) {
    return {exercise: 'No Person', correct: false, details: '', reps: 0};
  }

  // Calculate key angles
  const leftKneeAngle = getAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = getAngle(rightHip, rightKnee, rightAnkle);
  const leftHipAngle = getAngle(leftShoulder, leftHip, leftKnee);
  const rightHipAngle = getAngle(rightShoulder, rightHip, rightKnee);
  const leftElbowAngle = leftWrist ? getAngle(leftShoulder, leftElbow, leftWrist) : 180;
  const rightElbowAngle = rightWrist ? getAngle(rightShoulder, rightElbow, rightWrist) : 180;
  
  // Debug output
  if (debugMode) {
    console.log('Left knee:', leftKneeAngle.toFixed(1), 'Right knee:', rightKneeAngle.toFixed(1));
    console.log('Left hip:', leftHipAngle.toFixed(1), 'Right hip:', rightHipAngle.toFixed(1));
    console.log('Left elbow:', leftElbowAngle.toFixed(1), 'Right elbow:', rightElbowAngle.toFixed(1));
    console.log('---------------');
  }

  let currentExercise = '';
  let result = {exercise: 'Unknown', correct: false, details: '', reps: repCount};
  
  // If we're in focused mode, only detect that specific exercise
  if (activeExerciseMode !== null) {
    // Skip all other detection logic except the one we want
    if (activeExerciseMode !== 'Squat' && 
        activeExerciseMode !== 'Push-up' && 
        activeExerciseMode !== 'Plank' &&
        activeExerciseMode !== 'Lunge' &&
        activeExerciseMode !== 'Bicep Curl' &&
        activeExerciseMode !== 'Overhead Press' &&
        activeExerciseMode !== 'Lateral Raise' &&
        activeExerciseMode !== 'Jumping Jack') {
      activeExerciseMode = null; // Reset if invalid
    }
  }
  
  // --- SQUAT DETECTION (more precise) ---
  // Stricter conditions for squat detection
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
  const avgHipAngle = (leftHipAngle + rightHipAngle) / 2;
  
  // Check that feet are approximately shoulder-width apart
  const shoulderWidth = getDistance(leftShoulder, rightShoulder);
  const feetWidth = getDistance(leftAnkle, rightAnkle);
  const feetCorrectWidth = feetWidth > (shoulderWidth * 0.7) && feetWidth < (shoulderWidth * 1.5);
  
  // Both feet should be at similar height (on ground)
  const feetLevelY = Math.abs(leftAnkle.y - rightAnkle.y) < 0.05;
  
  // Knees bent, hips lowered, back upright, feet properly positioned
  // Make squat detection more lenient
  if ((activeExerciseMode === null || activeExerciseMode === 'Squat') &&
      avgKneeAngle < 150 && avgKneeAngle > 60 && avgHipAngle > 60) {
    
    currentExercise = 'Squat';
    validExerciseState = true;
    
    // Check for rep counting - detect squat down position
    if (avgKneeAngle < 95) {
      // Down position detected
      if (!exerciseStates.Squat.down) {
        exerciseStates.Squat.down = true;
      }
      result = {exercise: 'Squat', correct: true, details: 'Perfect squat depth!', reps: repCount};
    } else if (avgKneeAngle < 115) {
      // Still in squat, but not at full depth
      result = {exercise: 'Squat', correct: true, details: 'Good squat!', reps: repCount};
    } else {
      // Coming up from squat
      if (exerciseStates.Squat.down) {
        // Count a rep when transitioning from down to up
        repCount++;
        exerciseStates.Squat.down = false;
        result = {exercise: 'Squat', correct: true, details: 'Rep counted!', reps: repCount};
      } else {
        result = {exercise: 'Squat', correct: true, details: 'Preparing for squat', reps: repCount};
      }
    }
    
    // Check if back is straight
    if (Math.abs(leftHipAngle - rightHipAngle) > 20) {
      result.correct = false;
      result.details += ' Keep your back straight!';
    }
  }

  // --- STANDING DETECTION (improved) ---
  if (activeExerciseMode === null && avgKneeAngle > 160 && avgHipAngle > 160) {
    // Check for arms down (not jumping jack)
    if (leftWrist && rightWrist && leftWrist.y > leftHip.y && rightWrist.y > rightHip.y) {
      currentExercise = 'Standing';
      result = {exercise: 'Standing', correct: true, details: 'Standing straight', reps: repCount};
    }
  }

  // --- JUMPING JACK DETECTION (improved) ---
  if ((activeExerciseMode === null || activeExerciseMode === 'Jumping Jack') && 
      leftWrist && rightWrist && leftAnkle && rightAnkle && leftHip && rightHip) {
    // Arms raised above shoulders and legs apart
    const handsUp = leftWrist.y < leftShoulder.y - 0.05 && rightWrist.y < rightShoulder.y - 0.05;
    const armsOut = leftWrist.x < leftShoulder.x - 0.1 && rightWrist.x > rightShoulder.x + 0.1;
    const feetApart = Math.abs(leftAnkle.x - rightAnkle.x) > 0.25;
    
    if (handsUp && feetApart) {
      currentExercise = 'Jumping Jack';
      result = {exercise: 'Jumping Jack', correct: true, details: 'Good jumping jack!', reps: repCount};
    } else if (handsUp && armsOut) {
      currentExercise = 'Jumping Jack';
      result = {exercise: 'Jumping Jack', correct: false, details: 'Spread legs more!', reps: repCount};
    }
  }

  // --- PUSH-UP DETECTION (improved) ---
  if ((activeExerciseMode === null || activeExerciseMode === 'Push-up') && 
      leftShoulder && rightShoulder && leftHip && rightHip && leftAnkle && rightAnkle) {
    // Body alignment check - shoulders, hips, ankles should form a straight line
    const bodyAligned = Math.abs(leftShoulder.y - rightShoulder.y) < 0.1 &&
                        Math.abs(leftHip.y - rightHip.y) < 0.1 &&
                        Math.abs(leftAnkle.y - rightAnkle.y) < 0.1;
    
    // Check if body is horizontal
    const bodyHorizontal = Math.abs(leftShoulder.y - leftHip.y) < 0.15 && 
                          Math.abs(leftHip.y - leftAnkle.y) < 0.15;
    
    // Check elbow angles for push-up position
    if (bodyAligned && bodyHorizontal) {
      currentExercise = 'Push-up';
      validExerciseState = true;
      
      const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
      
      // Rep counting logic
      if (avgElbowAngle < 110) {
        // Down position
        if (!exerciseStates['Push-up'].down) {
          exerciseStates['Push-up'].down = true;
        }
        result = {exercise: 'Push-up', correct: true, details: 'Good push-up down position!', reps: repCount};
      } else if (avgElbowAngle > 150) {
        // Up position - if transitioning from down, count a rep
        if (exerciseStates['Push-up'].down) {
          repCount++;
          exerciseStates['Push-up'].down = false;
        }
        result = {exercise: 'Push-up', correct: true, details: `Good push-up up position!`, reps: repCount};
      } else {
        // Transition between positions
        result = {exercise: 'Push-up', correct: false, details: 'Complete the movement!', reps: repCount};
      }
      
      // Check if hips are sagging or too high
      const hipAlignment = leftHip.y - ((leftShoulder.y + leftAnkle.y) / 2);
      if (hipAlignment > 0.05) {
        result.correct = false;
        result.details = 'Hips too low! Keep body straight.';
      } else if (hipAlignment < -0.05) {
        result.correct = false;
        result.details = 'Hips too high! Lower your body.';
      }
    }
  }

  // --- LUNGE DETECTION (improved) ---
  // One knee bent, one straight, feet apart
  const feetApart = Math.abs(leftAnkle.x - rightAnkle.x) > 0.2;
  
  if (leftKneeAngle < 110 && rightKneeAngle > 150 && feetApart) {
    currentExercise = 'Lunge';
    
    // Rep counting - detect down position for lunge
    if (!exerciseStates.Lunge.down) {
      exerciseStates.Lunge.down = true;
    }
    
    result = {exercise: 'Lunge (left)', correct: true, details: 'Good left lunge!', reps: repCount};
    
    // Check for upright torso
    if (leftHipAngle < 80 || rightHipAngle < 80) {
      result.correct = false;
      result.details = 'Keep torso more upright!';
    }
  } else if (rightKneeAngle < 110 && leftKneeAngle > 150 && feetApart) {
    currentExercise = 'Lunge';
    
    // Rep counting - detect down position for lunge
    if (!exerciseStates.Lunge.down) {
      exerciseStates.Lunge.down = true;
    }
    
    result = {exercise: 'Lunge (right)', correct: true, details: 'Good right lunge!', reps: repCount};
    
    // Check for upright torso
    if (leftHipAngle < 80 || rightHipAngle < 80) {
      result.correct = false;
      result.details = 'Keep torso more upright!';
    }
  } else if (currentExercise === 'Lunge' && leftKneeAngle > 150 && rightKneeAngle > 150) {
    // Standing up from lunge - count a rep
    if (exerciseStates.Lunge.down) {
      repCount++;
      exerciseStates.Lunge.down = false;
    }
  }
  
  // --- PLANK DETECTION ---
  if (leftElbow && rightElbow && leftShoulder && rightShoulder && leftHip && rightHip && leftAnkle && rightAnkle) {
    // Elbows under shoulders, body straight
    const elbowsUnderShoulders = Math.abs(leftElbow.x - leftShoulder.x) < 0.1 && 
                                Math.abs(rightElbow.x - rightShoulder.x) < 0.1;
    
    const bodyHorizontal = Math.abs(leftShoulder.y - leftHip.y) < 0.15 && 
                          Math.abs(leftHip.y - leftAnkle.y) < 0.15;
                          
    const forearmOnGround = leftWrist && rightWrist && 
                          Math.abs(leftElbow.y - leftWrist.y) < 0.05 && 
                          Math.abs(rightElbow.y - rightWrist.y) < 0.05;
    
    if (elbowsUnderShoulders && bodyHorizontal && forearmOnGround) {
      currentExercise = 'Plank';
      
      // Start the plank timer if not already started
      if (!exerciseStates.Plank.isHolding) {
        exerciseStates.Plank.isHolding = true;
        exerciseStates.Plank.timer = new Date().getTime();
      }
      
      // Calculate hold time in seconds
      const currentTime = new Date().getTime();
      const holdTime = Math.floor((currentTime - exerciseStates.Plank.timer) / 1000);
      
      result = {exercise: 'Plank', correct: true, details: `Good plank position! Holding for ${holdTime}s`, reps: holdTime};
      
      // Check if hips are sagging or too high
      const hipAlignment = leftHip.y - ((leftShoulder.y + leftAnkle.y) / 2);
      if (hipAlignment > 0.05) {
        result.correct = false;
        result.details = `Hips too low! Keep body straight. (${holdTime}s)`;
      } else if (hipAlignment < -0.05) {
        result.correct = false;
        result.details = `Hips too high! Lower your hips. (${holdTime}s)`;
      }
    } else if (exerciseStates.Plank.isHolding) {
      // Reset plank timer when position is broken
      exerciseStates.Plank.isHolding = false;
    }
  }
  
  // --- BICEP CURL DETECTION ---
  if (leftShoulder && leftElbow && leftWrist && rightShoulder && rightElbow && rightWrist) {
    // Arms by side, elbows fixed
    const leftArmBySide = Math.abs(leftElbow.x - leftShoulder.x) < 0.1;
    const rightArmBySide = Math.abs(rightElbow.x - rightShoulder.x) < 0.1;
    
    if (leftArmBySide && rightArmBySide) {
      // Detect bicep curl with either arm
      if (leftElbowAngle < 60 && leftWrist.y < leftShoulder.y) {
        currentExercise = 'Bicep Curl';
        validExerciseState = true;
        
        // Detect up position for bicep curl
        if (!exerciseStates['Bicep Curl'].down) {
          exerciseStates['Bicep Curl'].down = true;
        }
        
        result = {exercise: 'Bicep Curl (Left)', correct: true, details: 'Good left curl!', reps: repCount};
      } else if (rightElbowAngle < 60 && rightWrist.y < rightShoulder.y) {
        currentExercise = 'Bicep Curl';
        validExerciseState = true;
        
        // Detect up position for bicep curl
        if (!exerciseStates['Bicep Curl'].down) {
          exerciseStates['Bicep Curl'].down = true;
        }
        
        result = {exercise: 'Bicep Curl (Right)', correct: true, details: 'Good right curl!', reps: repCount};
      } else if ((leftElbowAngle > 150 || rightElbowAngle > 150) && 
                (leftWrist.y > leftElbow.y || rightWrist.y > rightElbow.y)) {
        // Down position - if transitioning from up, count a rep
        currentExercise = 'Bicep Curl';
        validExerciseState = true;
        
        if (exerciseStates['Bicep Curl'].down) {
          repCount++;
          exerciseStates['Bicep Curl'].down = false;
          console.log("Bicep Curl rep counted!");
        }
        
        result = {exercise: 'Bicep Curl', correct: true, details: 'Arms extended', reps: repCount};
      } else if ((leftElbowAngle < 110 && leftWrist.y < leftElbow.y) || 
                (rightElbowAngle < 110 && rightWrist.y < rightElbow.y)) {
        currentExercise = 'Bicep Curl';
        validExerciseState = true;
        result = {exercise: 'Bicep Curl', correct: false, details: 'Complete the curl movement!', reps: repCount};
      }
    }
  }
  
  // --- OVERHEAD PRESS DETECTION ---
  if (leftShoulder && leftElbow && leftWrist && rightShoulder && rightElbow && rightWrist) {
    const armsOverhead = leftWrist.y < leftShoulder.y - 0.2 && rightWrist.y < rightShoulder.y - 0.2;
    const armsExtended = leftElbowAngle > 160 && rightElbowAngle > 160;
    
    if (armsOverhead && armsExtended) {
      currentExercise = 'Overhead Press';
      
      // Up position
      if (!exerciseStates['Overhead Press']) {
        exerciseStates['Overhead Press'] = { down: false, threshold: 90 };
      }
      
      if (exerciseStates['Overhead Press'].down) {
        // Count rep if transitioning from down position
        repCount++;
        exerciseStates['Overhead Press'].down = false;
      }
      
      result = {exercise: 'Overhead Press', correct: true, details: `Good press position! (${repCount} reps)`, reps: repCount};
    } else if (armsOverhead) {
      currentExercise = 'Overhead Press';
      result = {exercise: 'Overhead Press', correct: false, details: 'Extend arms fully!', reps: repCount};
    } else if (leftElbow.y < leftShoulder.y && rightElbow.y < rightShoulder.y) {
      // Down position
      if (!exerciseStates['Overhead Press']) {
        exerciseStates['Overhead Press'] = { down: false, threshold: 90 };
      }
      
      exerciseStates['Overhead Press'].down = true;
      
      currentExercise = 'Overhead Press';
      result = {exercise: 'Overhead Press', correct: false, details: 'Press arms overhead!', reps: repCount};
    }
  }
  
  // --- LATERAL RAISE DETECTION ---
  if (leftShoulder && leftElbow && rightShoulder && rightElbow) {
    const armsOut = leftElbow.y < leftShoulder.y && rightElbow.y < rightShoulder.y && 
                   leftElbow.x < leftShoulder.x - 0.1 && rightElbow.x > rightShoulder.x + 0.1;
                   
    if (armsOut && leftElbowAngle > 150 && rightElbowAngle > 150) {
      currentExercise = 'Lateral Raise';
      
      // Up position for lateral raise
      if (!exerciseStates['Lateral Raise']) {
        exerciseStates['Lateral Raise'] = { down: false, threshold: 90 };
      }
      
      if (!exerciseStates['Lateral Raise'].down) {
        exerciseStates['Lateral Raise'].down = true;
      }
      
      // Check if arms are at shoulder level
      if (Math.abs(leftElbow.y - leftShoulder.y) < 0.05 && Math.abs(rightElbow.y - rightShoulder.y) < 0.05) {
        result = {exercise: 'Lateral Raise', correct: true, details: 'Perfect lateral raise!', reps: repCount};
      } else if (leftElbow.y < leftShoulder.y - 0.05 || rightElbow.y < rightShoulder.y - 0.05) {
        result = {exercise: 'Lateral Raise', correct: false, details: 'Lower your arms to shoulder level', reps: repCount};
      } else {
        result = {exercise: 'Lateral Raise', correct: false, details: 'Raise arms to shoulder level', reps: repCount};
      }
    } else if (exerciseStates['Lateral Raise'] && exerciseStates['Lateral Raise'].down) {
      // Arms down - count a rep
      if (leftElbow.y > leftShoulder.y + 0.1 && rightElbow.y > rightShoulder.y + 0.1) {
        repCount++;
        exerciseStates['Lateral Raise'].down = false;
      }
    }
  }
  
  // Log the current detection state for debugging
  if (debugMode) {
    console.log("Current exercise detection:", currentExercise);
    if (currentExercise) {
      console.log("Detection details:", result);
    }
  }
  
  // Lower the confidence threshold to make detection more immediate
  const REDUCED_THRESHOLD = 2;
  
  // Check if exercise changed
  if (currentExercise !== '' && currentExercise !== prevExercise) {
    // Reset rep counter when switching exercises
    if (prevExercise !== '' && prevExercise !== currentExercise) {
      resetRepCounter();
    }
    
    // Start building confidence faster
    exerciseConfidence = 2;
    console.log("New exercise detected:", currentExercise);
  } else if (currentExercise === prevExercise && currentExercise !== '') {
    // Continue building confidence for the same exercise
    exerciseConfidence = Math.min(exerciseConfidence + 1, REDUCED_THRESHOLD + 5);
  } else {
    // No exercise detected in this frame
    exerciseConfidence = Math.max(0, exerciseConfidence - 0.25); // Slower decay
  }
  
  // In focused exercise mode, only count the selected exercise
  if (activeExerciseMode !== null) {
    if (currentExercise === activeExerciseMode) {
      // We're doing the selected exercise
      result.reps = repCount;
      prevExercise = currentExercise;
      return result;
    } else {
      // Looking for specific exercise
      return {
        exercise: 'Unknown', 
        correct: false, 
        details: `Looking for ${activeExerciseMode} exercise...`, 
        reps: repCount
      };
    }
  }
  
  // Return conditions for all exercise modes
  if (exerciseConfidence >= REDUCED_THRESHOLD && currentExercise !== '') {
    prevExercise = currentExercise;
    result.reps = repCount;
    return result;
  } else if (prevExercise && exerciseConfidence > 0) {
    // Keep showing the previous exercise while transitioning
    return {exercise: prevExercise, correct: false, details: 'Continue...', reps: repCount};
  } else {
    // Nothing detected with confidence
    return {exercise: 'Unknown', correct: false, details: 'Move into exercise position', reps: 0};
  }
}

// Add calibration function to improve pose detection
let userHeight = 0;
let isCalibrated = true; // Always calibrated to avoid issues

function calibrateUser(landmarks) {
  // Simplified calibration that always succeeds
  if (!landmarks) return true;
  return true;
}

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if (results.segmentationMask) {
    canvasCtx.drawImage(results.segmentationMask, 0, 0,
                        canvasElement.width, canvasElement.height);
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillStyle = '#00FF00';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.globalCompositeOperation = 'source-over';
  } else {
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  }

  // Force calibration to true and enable debug mode to troubleshoot
  isCalibrated = true;
  if (!debugMode) {
    debugMode = true;
    console.log("Debug mode enabled automatically to troubleshoot detection issues");
  }

  // Draw landmarks
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                 {color: '#00FF00', lineWidth: 4});
  drawLandmarks(canvasCtx, results.poseLandmarks,
                {color: '#FF0000', lineWidth: 2});
  
  // Only draw face and hands if needed (reduces visual clutter)
  if (debugMode) {
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
                  {color: '#C0C0C070', lineWidth: 1});
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
                  {color: '#CC0000', lineWidth: 5});
    drawLandmarks(canvasCtx, results.leftHandLandmarks,
                  {color: '#00FF00', lineWidth: 2});
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
                  {color: '#00CC00', lineWidth: 5});
    drawLandmarks(canvasCtx, results.rightHandLandmarks,
                  {color: '#FF0000', lineWidth: 2});
  }
  
  canvasCtx.restore();

  // Exercise classification and feedback
  const result = classifyExercise(results.poseLandmarks);
  
  // Display current detection state with more debug info
  if (result.exercise === 'No Person') {
    feedbackDiv.innerText = 'No person detected';
    feedbackDiv.style.color = '#FFFFFF';
    feedbackDiv.style.fontSize = '2.2em';
  } else if (result.exercise === 'Unknown') {
    if (activeExerciseMode) {
      feedbackDiv.innerText = `Looking for ${activeExerciseMode} exercise...`;
    } else {
      feedbackDiv.innerText = 'Move into exercise position';
    }
    feedbackDiv.style.color = '#FFFF00';
    feedbackDiv.style.fontSize = '2.2em';
  } else {
    // Display exercise with rep count
    if (result.exercise === 'Plank') {
      // For plank, we show the hold time directly
      feedbackDiv.innerText = `${result.exercise}: ${result.details}`;
    } else {
      // For counting exercises, include rep count
      feedbackDiv.innerText = `${result.exercise}: ${result.details} (${result.reps} reps)`;
    }
    feedbackDiv.style.color = result.correct ? '#00FF00' : '#FF0000';
    feedbackDiv.style.fontSize = '2.2em';
  }
  
  // Update the rep count display in the UI
  const repCountDisplay = document.getElementById('repCountDisplay');
  if (repCountDisplay) {
    repCountDisplay.innerText = result.reps || '0';
  }
  
  // Add extra debug information on screen
  if (debugMode) {
    let debugInfo = document.getElementById('debugInfo');
    if (!debugInfo) {
      debugInfo = document.createElement('div');
      debugInfo.id = 'debugInfo';
      debugInfo.style.position = 'absolute';
      debugInfo.style.bottom = '10px';
      debugInfo.style.left = '10px';
      debugInfo.style.color = '#FFFF00';
      debugInfo.style.backgroundColor = 'rgba(0,0,0,0.5)';
      debugInfo.style.padding = '5px';
      document.body.appendChild(debugInfo);
    }
    
    const landmarkInfo = landmarks => {
      if (!landmarks || !landmarks.length) return 'No landmarks';
      return `Landmarks: ${landmarks.length}, First visible: ${landmarks[0].visibility?.toFixed(2) || 'N/A'}`;
    };
    
    // Include rep count in debug info
    debugInfo.innerHTML = `Mode: ${activeExerciseMode || 'All exercises'}<br>
                          Reps: ${repCount}<br>
                          Confidence: ${exerciseConfidence}/2<br>
                          ${landmarkInfo(results.poseLandmarks)}<br>
                          Press 0-4 to select exercise`;
    
    console.log(`${result.exercise}: ${result.details} (${result.reps} reps)`);
    console.log(`Confidence level: ${exerciseConfidence}/2`);
  }
}

const holistic = new Holistic({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
}});
holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  refineFaceLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
holistic.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();

// Make window.resetRepCounter available for the UI
window.resetRepCounter = resetRepCounter;
