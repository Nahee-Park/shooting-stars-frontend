import styled from '@emotion/styled';
import React, { Dispatch, SetStateAction, useState, useRef } from 'react';
import PlusIcon from '@src/assets/Icon/PlusIcon.svg';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { flushSync } from 'react-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import { useRouter } from 'next/router';

interface UploadImageProps {
  setImageData: Dispatch<SetStateAction<string | null>>;
}

function UploadImage({ setImageData }: UploadImageProps) {
  const router = useRouter();
  const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
  const inputRef = useRef(null);
  const [isLoadig, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    flushSync(() => {
      setIsLoading(true);
    });
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setImageData(url);
      console.log('>>url', url);
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
    const reader = new FileReader();

    reader.readAsDataURL(file);

    return new Promise((resolve) => {
      reader.onload = () => {
        setPreviewImage(reader.result);
        console.log('>>reader.result', reader.result);

        resolve();
        flushSync(() => {
          setIsLoading(false);
        });
      };
    });
  };

  return (
    <StyledRoot className="upload__image">
      {router?.query?.imageData || previewImage ? (
        <img
          src={router?.query?.imageData ? router?.query?.imageData : previewImage}
          alt="dao image"
        />
      ) : isLoadig ? (
        <ClipLoader color="#FFE55C" loading={isLoadig} size={50} />
      ) : (
        <>
          <label className="upload__image--input" htmlFor="input-file"></label>
          <input ref={inputRef} id="input-file" type="file" name="Asset" onChange={handleChange} />
          <PlusIcon />
        </>
      )}
    </StyledRoot>
  );
}

export default UploadImage;

const StyledRoot = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  .upload__image--input {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    position: absolute;
    cursor: pointer;
  }
  & img {
    object-fit: cover;
    min-height: 200px;
    min-width: 200px;
  }
  #input-file {
    display: none;
  }
  & svg {
    cursor: pointer;
  }
`;
