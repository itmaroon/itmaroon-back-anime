import { useEffect, useState } from '@wordpress/element';

// image file export component
const ImageList = () => {
  const [imageList, setImageList] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(back_anime.plugin_url + '/build/fileList.json');
        const data = await response.json();
        setImageList(data.map(item => {
          return {
            label: <div style={{ background: `url(${back_anime.plugin_url}/assets/img/${item}) no-repeat center center / cover` }} />,
            value: item
          }
        }));
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  return imageList;
};

export default ImageList;

