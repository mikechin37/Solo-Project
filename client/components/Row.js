import React from 'react';
import Square from './Square';
import PropTypes from 'prop-types';

const Row = (props) => {
  const { letters, handleClick, row, artUrl, songUrl } = props;
  const squareElements = letters.map((letter, i) => (
    <Square key={row + i} row={row} square={i} letter={letter} handleClick={handleClick} artUrl={artUrl[i]} songUrl={songUrl[i]} />
  ));
  return (
    <div className="row">
      {squareElements}
    </div>
  );
};

Row.propTypes = {
  letters: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleClick: PropTypes.func.isRequired,
  row: PropTypes.number.isRequired,
};

export default Row;
