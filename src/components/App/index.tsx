import { h, Component } from 'preact';

import { bind, drawBitmapToCanvas, linkRef } from '../../lib/util';
import * as style from './style.scss';

import { FileDropEvent } from './custom-els/FileDrop';
import './custom-els/FileDrop';
import './custom-els/PinchZoom';

interface Props {}

interface State {
  leftImage?: ImageBitmap;
  rightImage?: ImageBitmap;
  leftLoaded: boolean;
  rightLoaded: boolean;
  error?: string;
}

enum ImageSide {
  left,
  right
}

export default class App extends Component<Props, State> {
  state: State = {
    leftLoaded: false,
    rightLoaded: false
  };
  
  canvasLeft?: HTMLCanvasElement;
  canvasRight?: HTMLCanvasElement;

  constructor() {
    super();
    // In development, persist application state across hot reloads:
    if (process.env.NODE_ENV === 'development') {
      this.setState(window.STATE);
      const oldCDU = this.componentDidUpdate;
      this.componentDidUpdate = (props, state) => {
        if (oldCDU) oldCDU.call(this, props, state);
        window.STATE = this.state;
      };
    }
  }
  
  componentDidUpdate(prevProps: Props, prevState: State): void {
    const {leftImage, rightImage} = this.state;
    
    if (this.canvasLeft && leftImage) {
      drawBitmapToCanvas(this.canvasLeft, leftImage);
    }
    if (this.canvasRight && rightImage) {
      drawBitmapToCanvas(this.canvasRight, rightImage);
    }
  }

  @bind
  async onFileChange(event: Event): Promise<void> {
    const fileInput = event.target as HTMLInputElement;
    const side:ImageSide = (fileInput.classList.contains('left')) ? ImageSide.left : ImageSide.right;
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    
    await this.updateFile(file, side);
  }

  @bind
  async onFileDrop(event: FileDropEvent) {
    const { file } = event;
    const side:ImageSide = ((event.target as HTMLElement).classList.contains('left')) ? ImageSide.left : ImageSide.right;
    if (!file) return;
    await this.updateFile(file, side);
  }

  async updateFile(file: File, side:ImageSide) {
    let newState = this.state; // this feels dirty
    
    if(side === ImageSide.left) {
      newState.leftImage = await createImageBitmap(file);
      newState.leftLoaded = true;
    }
    else {
      newState.rightImage = await createImageBitmap(file);
      newState.rightLoaded = true;
    }
    
    this.setState(newState);
  }

  render({ }: Props, { leftLoaded, rightLoaded, error, leftImage, rightImage }: State) {
    
    const leftImageAttrs = leftImage ? { height: leftImage.height, width: leftImage.width } : {width: 300, height: 200};
    const rightImageAttrs = rightImage ? { height: rightImage.height, width: rightImage.width } : {width: 300, height: 200};
    const leftImageStyles = { display: (leftLoaded) ? 'none' : 'block' };
    const rightImageStyles = { display: (rightLoaded) ? 'none' : 'block'};
     
    return (
      <div class={style.app}>
        <pinch-zoom class={style.left}>
          <file-drop class='left' accept="image/*" onfiledrop={this.onFileDrop}>
            <input class='left' type="file" onChange={this.onFileChange} style={ leftImageStyles } />
            <canvas 
              ref={linkRef(this, 'canvasLeft')}
              width={leftImageAttrs.width}
              height={leftImageAttrs.height} />
          </file-drop>
        </pinch-zoom>
        <pinch-zoom class={style.right}>
          <file-drop class='right' accept="image/*" onfiledrop={this.onFileDrop}>
            <input class='right' type="file" onChange={this.onFileChange} style={ rightImageStyles } />
            <canvas 
              ref={linkRef(this, 'canvasRight')}
              width={rightImageAttrs.width}
              height={rightImageAttrs.height}/>
          </file-drop>
        </pinch-zoom>
      </div>
    );
  }
}
