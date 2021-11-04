import React from 'react';
import PropTypes from 'prop-types';

const Square = (props) => {
  const { handleClick, letter, row, square, artUrl } = props;

  return (
    <div className="square" onClick={() => {handleClick(row, square)}}>
      <img src = {artUrl}/>
      {letter}
    </div>
  );
};

Square.propTypes = {
  handleClick: PropTypes.func.isRequired,
  letter: PropTypes.string,
  row: PropTypes.number.isRequired,
  square: PropTypes.number.isRequired
};

export default Square;
