function checkFocusTimeAndTrack() {
  chrome.storage.local.get(
    ["enabled", "startTime", "endTime", "focusToday", "lastUsedDate", "streak"],
    (data) => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = now.toISOString().split('T')[0];

      let withinTime = false;
      if (data.startTime && data.endTime) {
        withinTime =
          (data.startTime <= data.endTime && currentTime >= data.startTime && currentTime < data.endTime) ||
          (data.startTime > data.endTime &&
            (currentTime >= data.startTime || currentTime < data.endTime));
      }

      chrome.storage.local.set({ enabled: withinTime });

      chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: "FOCUS_MODE_TOGGLE",
            enabled: withinTime
          });
        });
      });

      if (withinTime) {
        const lastDate = data.lastUsedDate;
        let streak = data.streak || 0;
        let focusToday = data.focusToday || 0;

        if (lastDate !== todayStr) {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastDate && lastDate !== yesterdayStr) {
            chrome.notifications?.create({
              type: "basic",
              iconUrl: "icons/icon128.png",
              title: "Streak Broken 💔",
              message: "You missed a day! Streak resets to 1. Let’s bounce back!"
            });
          }

          streak = lastDate === yesterdayStr ? streak + 1 : 1;
          focusToday = 0;
        }

        focusToday += 1;

        chrome.storage.local.set({
          lastUsedDate: todayStr,
          focusToday,
          streak
        }, () => {
          localStorage.setItem('focusBackup', JSON.stringify({
            date: todayStr,
            streak,
            focusToday
          }));
        });
      }
    }
  );
}

setInterval(checkFocusTimeAndTrack, 60000);
