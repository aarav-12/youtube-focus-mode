function updateFocusTracking() {
  chrome.storage.local.get(["enabled", "focusToday", "lastTrackedDay", "streak"], (data) => {
    const now = new Date();
    const todayKey = now.toISOString().split("T")[0]; // YYYY-MM-DD

    let focusToday = data.focusToday ?? 0;
    let lastDay = data.lastTrackedDay ?? todayKey;
    let streak = data.streak ?? 0;

    if (data.enabled) {
      // If new day, reset focusToday and maybe increment streak
      if (lastDay !== todayKey) {
        if (focusToday >= 30) streak += 1;
        else streak = 0;
        focusToday = 0;
        lastDay = todayKey;
      }

      focusToday += 1;
    }

    chrome.storage.local.set({
      focusToday,
      lastTrackedDay: todayKey,
      streak
    });
  });
}

export default updateFocusTracking;
