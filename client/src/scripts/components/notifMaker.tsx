export function newNotif(msg: string, level: number) {
  const oldData = localStorage.getItem("active-notifs");
  const arrayOfOldData: {
    msg: string;
    level: number;
    id: string;
  }[] = oldData ? JSON.parse(oldData) : [];

  arrayOfOldData.push({
    msg,
    level,
    id: crypto.randomUUID(),
  });

  localStorage.setItem("active-notifs", JSON.stringify(arrayOfOldData));
}
