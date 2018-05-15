import moment from 'moment-timezone';

export const isHoliday = () => {
  var _holidays = {
    'M': {//Month, Day
      '01/01': "New Year's Day",
      '07/04': "Independence Day",
      '11/11': "Veteran's Day",
      '11/28': "Thanksgiving Day",
      '11/29': "Day after Thanksgiving",
      '12/24': "Christmas Eve",
      '12/25': "Christmas Day",
      '12/31': "New Year's Eve"
    },
    'W': {//Month, Week of Month, Day of Week
      '1/3/1': "Martin Luther King Jr. Day",
      '2/3/1': "Washington's Birthday",
      '5/5/1': "Memorial Day",
      '9/1/1': "Labor Day",
      '10/2/1': "Columbus Day",
      '11/4/4': "Thanksgiving Day"
    }
  };

  const now = new Date();
  const nowM = moment(now);

  const diff = 1 + (0 | (now.getDate() - 1) / 7);
  const memorial = (now.getDay() === 1 && (now.getDate() + 7) > 30) ? "5" : null;
  const returnV = _holidays['M'][nowM.format('MM/DD')] || _holidays['W'][nowM.format('M/'+ (memorial || diff) +'/d')];

  return (returnV || null);
};
