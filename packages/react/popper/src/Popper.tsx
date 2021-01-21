import * as React from 'react';
import { getPlacementData } from '@radix-ui/popper';
import { createContext, useRect, useSize, useComposedRefs } from '@radix-ui/react-utils';
import { Primitive } from '@radix-ui/react-primitive';
import { Arrow as ArrowPrimitive } from '@radix-ui/react-arrow';
import { getSelector, getSelectorObj, makeRect } from '@radix-ui/utils';

import type * as Polymorphic from '@radix-ui/react-polymorphic';
import type { Side, Align, Size, MeasurableElement, Merge } from '@radix-ui/utils';

/* -------------------------------------------------------------------------------------------------
 * Root level context
 * -----------------------------------------------------------------------------------------------*/

type PopperContextValue = {
  arrowRef: React.RefObject<HTMLElement>;
  setArrowOffset: (offset?: number) => void;
  arrowStyles: React.CSSProperties;
};

const [PopperContext, usePopperContext] = createContext<PopperContextValue>(
  'PopperContext',
  'Popper'
);

/* -------------------------------------------------------------------------------------------------
 * Popper
 * -----------------------------------------------------------------------------------------------*/

const POPPER_NAME = 'Popper';

type PopperOwnProps = Merge<
  Polymorphic.OwnProps<typeof Primitive>,
  {
    anchorRef: React.RefObject<MeasurableElement>;
    side?: Side;
    sideOffset?: number;
    align?: Align;
    alignOffset?: number;
    collisionTolerance?: number;
    avoidCollisions?: boolean;
  }
>;

type PopperPrimitive = Polymorphic.ForwardRefComponent<
  Polymorphic.IntrinsicElement<typeof Primitive>,
  PopperOwnProps
>;

const Popper = React.forwardRef((props, forwardedRef) => {
  const {
    selector = getSelector(POPPER_NAME),
    children,
    anchorRef,
    side = 'bottom',
    sideOffset,
    align = 'center',
    alignOffset,
    collisionTolerance,
    avoidCollisions = true,
    ...popperProps
  } = props;

  const [arrowOffset, setArrowOffset] = React.useState<number>();
  const anchorRect = useRect(anchorRef);
  const popperRef = React.useRef<HTMLDivElement>(null);
  const popperSize = useSize(popperRef);
  const arrowRef = React.useRef<HTMLSpanElement>(null);
  const arrowSize = useSize(arrowRef);

  const composedPopperRef = useComposedRefs(forwardedRef, popperRef);

  const windowSize = useWindowSize();
  const collisionBoundariesRect = windowSize ? makeRect(windowSize, { x: 0, y: 0 }) : undefined;

  const { popperStyles, arrowStyles, placedSide, placedAlign } = getPlacementData({
    anchorRect,
    popperSize,
    arrowSize,

    // config
    arrowOffset,
    side,
    sideOffset,
    align,
    alignOffset,
    shouldAvoidCollisions: avoidCollisions,
    collisionBoundariesRect,
    collisionTolerance,
  });
  const isPlaced = placedSide !== undefined;

  const context = React.useMemo(() => ({ arrowRef, arrowStyles, setArrowOffset }), [arrowStyles]);

  return (
    <div style={popperStyles} {...(selector ? getSelectorObj(selector + '-wrapper') : undefined)}>
      <Primitive
        selector={selector}
        {...popperProps}
        style={{
          ...popperProps.style,
          // if the Popper hasn't been placed yet (not all measurements done)
          // we prevent animations so that users's animation don't kick in too early referring wrong sides
          animation: !isPlaced ? 'none' : undefined,
        }}
        ref={composedPopperRef}
        data-side={placedSide}
        data-align={placedAlign}
      >
        <PopperContext.Provider value={context}>{children}</PopperContext.Provider>
      </Primitive>
    </div>
  );
}) as PopperPrimitive;

Popper.displayName = POPPER_NAME;

/* -------------------------------------------------------------------------------------------------
 * PopperArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = 'PopperArrow';

type PopperArrowOwnProps = Merge<Polymorphic.OwnProps<typeof ArrowPrimitive>, { offset?: number }>;

type PopperArrowPrimitive = Polymorphic.ForwardRefComponent<
  Polymorphic.IntrinsicElement<typeof ArrowPrimitive>,
  PopperArrowOwnProps
>;

const PopperArrow = React.forwardRef(function PopperArrow(props, forwardedRef) {
  const { offset, ...arrowProps } = props;
  const { arrowRef, setArrowOffset, arrowStyles } = usePopperContext(ARROW_NAME);

  // send the Arrow's offset up to Popper
  React.useEffect(() => setArrowOffset(offset), [setArrowOffset, offset]);

  return (
    <span style={{ ...arrowStyles, pointerEvents: 'none' }}>
      <span
        // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
        // doesn't report size as we'd expect on SVG elements.
        // it reports their bounding box which is effectively the largest path inside the SVG.
        ref={arrowRef}
        style={{
          display: 'inline-block',
          verticalAlign: 'top',
          pointerEvents: 'auto',
        }}
      >
        <ArrowPrimitive
          selector={getSelector(ARROW_NAME)}
          {...arrowProps}
          ref={forwardedRef}
          style={{
            ...arrowProps.style,
            // ensures the element can be measured correctly (mostly for if SVG)
            display: 'block',
          }}
        />
      </span>
    </span>
  );
}) as PopperArrowPrimitive;

PopperArrow.displayName = ARROW_NAME;

/* -----------------------------------------------------------------------------------------------*/

const WINDOW_RESIZE_DEBOUNCE_WAIT_IN_MS = 100;

function useWindowSize() {
  const [windowSize, setWindowSize] = React.useState<Size | undefined>(undefined);

  React.useEffect(() => {
    let debounceTimerId: number;

    function updateWindowSize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }

    function handleResize() {
      window.clearTimeout(debounceTimerId);
      debounceTimerId = window.setTimeout(updateWindowSize, WINDOW_RESIZE_DEBOUNCE_WAIT_IN_MS);
    }

    updateWindowSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

const Root = Popper;
const Arrow = PopperArrow;

export {
  Popper,
  PopperArrow,
  //
  Root,
  Arrow,
};
