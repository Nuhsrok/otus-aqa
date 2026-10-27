const scores = {
  Anna: 10,
  Olga: 1,
  Ivan: 5,
}

/**
 * Подсчитывает общую сумму баллов успеваемости.
 * 
 * @param {Object.<string, number>} scores - объект, где ключ это имя пользователя, а значение это его баллы.
 * @returns {number} - общую сумму баллов успеваемости всех пользователей.
 */


function getScore(scores) {
  let totalScore =0;
  for (const name in scores) {
    totalScore += scores[name];
  }
  return totalScore;  
}


console.log(getScore(scores))
