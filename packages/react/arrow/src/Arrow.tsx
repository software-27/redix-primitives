import * as React from 'react';
import { Primitive } from '@radix-ui/react-primitive';
import { getSelector } from '@radix-ui/utils';

import type * as Polymorphic from '@radix-ui/react-polymorphic';

const NAME = 'Arrow';
const DEFAULT_TAG = 'svg';

type ArrowOwnProps = Polymorphic.OwnProps<typeof Primitive>;
type ArrowPrimitive = Polymorphic.ForwardRefComponent<typeof DEFAULT_TAG, ArrowOwnProps>;

/**
 * We pass `ArrowImpl` in the `as` prop so that the whole svg
 * is replaced when consumer passes an `as` prop
 */
const Arrow = React.forwardRef((props, forwardedRef) => {
  return <Primitive as={ArrowImpl} selector={getSelector(NAME)} {...props} ref={forwardedRef} />;
}) as ArrowPrimitive;

const ArrowImpl = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof DEFAULT_TAG>>(
  (props, forwardedRef) => (
    <svg
      width={10}
      height={5}
      {...props}
      ref={forwardedRef}
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
    >
      <polygon points="0,0 30,0 15,10" />
    </svg>
  )
);

Arrow.displayName = NAME;

const Root = Arrow;

export {
  Arrow,
  //
  Root,
};
