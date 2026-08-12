
import {
  CheckboxControl, ColorPicker
} from '@wordpress/components';

import { useState } from '@wordpress/element';

const MultiSelect = ({ stockArrayName, stokArray, type, option, setAttributes }) => {
  //チェックボックスクリック時にstokArrayの内容を書き換え
  const handleOptionChange = (optionValue, checked) => {
    if (checked) {
      setAttributes({ [stockArrayName]: [...stokArray, optionValue] });
    } else {
      setAttributes({ [stockArrayName]: stokArray.filter((value) => value !== optionValue) });
    }
  };

  //選択されたColorItemの色を保持する状態変数
  const [activeColorIndex, setActiveColorIndex] = useState(null);
  //ColorItemがクリックされたときの処理
  const handleColorItemClick = (index) => {
    //同じ色見本が押されたらピッカーを消す
    setActiveColorIndex(index === activeColorIndex ? null : index);

  };
  //ColorPickerで色が設定されたときの処理
  const handleColorPickerChange = (color) => {
    let updatedArray;
    if (activeColorIndex >= stokArray.length) {
      updatedArray = [...stokArray, color.hex];
    } else {
      updatedArray = [...stokArray];
      updatedArray[activeColorIndex] = color.hex;
    }

    setAttributes({ [stockArrayName]: updatedArray });
  };
  //ColorDeleteがクリックされたときの処理
  const handleColorDelete = (indexToRemove) => {
    setAttributes({
      [stockArrayName]: stokArray.filter((item, index) => index !== indexToRemove)
    })
  }
  //ColorPlusがクリックされたときの処理
  const handleColorAdd = () => {
    setActiveColorIndex(stokArray.length);
  };

  return (
    <div>
      {type === 'checkBox' &&
        React.Children.map(option, (label) => {
          return (
            <CheckboxControl
              label={label}
              checked={stokArray.includes(label)}
              onChange={(checked) => handleOptionChange(label, checked)}
            />

          );
        })
      }
      {type === 'colorPicker' && (
        <>
          {stokArray.map((color, index) => (
            <div className='color_item' >
              {index == activeColorIndex &&
                <div className='color_circle checked' style={{ backgroundColor: color }} onClick={() => handleColorItemClick(index)}></div>
              }
              {index != activeColorIndex &&
                <div className='color_circle' style={{ backgroundColor: color }} onClick={() => handleColorItemClick(index)}></div>
              }
              <div className='color_delete' onClick={() => handleColorDelete(index)}></div>
            </div>
          ))}
          <div className='color_item color_plus' onClick={() => handleColorAdd()}></div>
          {activeColorIndex !== null && (
            <ColorPicker
              color={stokArray[activeColorIndex]}
              onChangeComplete={handleColorPickerChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MultiSelect;
