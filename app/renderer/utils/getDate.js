function getDate(stamp) {
  let date = new Date(stamp);
  function formate(v) {
    return v < 10 ? "0" + v : v;
  }
  let y = date.getFullYear();
  let m = formate(date.getMonth() + 1);
  let d = formate(date.getDate());
  let h = formate(date.getHours());
  let mm = formate(date.getMinutes());
  let s = formate(date.getSeconds());

  return `${m}-${d} ${h}:${mm}:${s}`;
}
