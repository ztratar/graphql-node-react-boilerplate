import moment from 'moment';

export const minifiedFromNow = function (inputTime) {
  let momentText = moment(inputTime).fromNow(true);

  momentText = momentText.replace(/seconds/g, 's');
  momentText = momentText.replace(/days/g, 'd');
  momentText = momentText.replace(/hours/g, 'h');
  momentText = momentText.replace(/minutes/g, 'm');
  momentText = momentText.replace(/months/g, 'mo');
  momentText = momentText.replace(/a day/g, '1 d');
  momentText = momentText.replace(/a minute/g, '1 m');
  momentText = momentText.replace(/a month/g, '1 mo');
  momentText = momentText.replace(/an hour/g, '1 hr');
  momentText = momentText.replace(/ /g, '');
  momentText = momentText.replace(/afews/g, 'Now');

  return momentText;
};
