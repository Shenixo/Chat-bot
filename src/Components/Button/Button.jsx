
import PropTypes from 'prop-types';
import "./Button.css"
const Button = ({onclickBtn, children}) => {
  return (
    <button style={{}} className='button' onClick={onclickBtn}>
      {children}
    </button>
  )
}

Button.propTypes = {
  onclickBtn: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export default Button
