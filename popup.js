document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleFocus");
  const strictness = document.getElementById("strictness");
  const strictnessValue = document.getElementById("strictnessValue");
  const startTime = document.getElementById("startTime");
  const endTime = document.getElementById("endTime");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const focusToday = document.getElementById("focusToday");
  const streak = document.getElementById("streak");

  const strictnessLabels = {
    1: "Low",
    2: "Low-Medium",
    3: "Medium",
    4: "Medium-High",
    5: "High"
  };

  chrome.storage.local.get(["enabled", "strictness", "startTime", "endTime", "darkMode", "focusToday", "streak"], (data) => {
    toggle.checked = data.enabled ?? false;
    const level = data.strictness ?? 3;
    strictness.value = level;
    strictnessValue.textContent = strictnessLabels[level];

    startTime.value = data.startTime ?? "";
    endTime.value = data.endTime ?? "";

    darkModeToggle.checked = data.darkMode ?? false;
    document.body.style.backgroundColor = darkModeToggle.checked ? "#1f1f1f" : "#ffffff";
    document.body.style.color = darkModeToggle.checked ? "#ffffff" : "#000000";

    focusToday.textContent = data.focusToday ?? 0;
    streak.textContent = data.streak ?? 0;
  });

  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    chrome.storage.local.set({ enabled });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "FOCUS_MODE_TOGGLE",
        enabled
      });
    });
  });

  strictness.addEventListener("input", () => {
    const level = parseInt(strictness.value, 10);
    strictnessValue.textContent = strictnessLabels[level];
    chrome.storage.local.set({ strictness: level });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "STRICTNESS_CHANGED",
        level
      });
    });
  });

  startTime.addEventListener("input", () => {
    chrome.storage.local.set({ startTime: startTime.value });
  });

  endTime.addEventListener("input", () => {
    chrome.storage.local.set({ endTime: endTime.value });
  });

  darkModeToggle.addEventListener("change", () => {
    const isDark = darkModeToggle.checked;
    chrome.storage.local.set({ darkMode: isDark });
    document.body.style.backgroundColor = isDark ? "#1f1f1f" : "#ffffff";
    document.body.style.color = isDark ? "#ffffff" : "#000000";
  });
});
