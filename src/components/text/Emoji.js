import nodeEmoji from 'node-emoji';
import PropTypes from 'prop-types';
import React from 'react';
import { fonts } from '../../styles';
import Text from './Text';

const Emoji = ({ children, name, ...props }) => (
  <Text {...props} isEmoji>
    {children || nodeEmoji.get(name)}
  </Text>
);

Emoji.propTypes = {
  lineHeight: PropTypes.oneOf(Object.keys(fonts.lineHeight)),
  name: PropTypes.string,
  size: PropTypes.oneOf(Object.keys(fonts.size)),
};

Emoji.defaultProps = {
  lineHeight: 'none',
  size: 'h4',
};

export default React.memo(Emoji);
