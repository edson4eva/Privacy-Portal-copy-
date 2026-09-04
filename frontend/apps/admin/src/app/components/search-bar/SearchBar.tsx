import { useEffect, useState } from 'react';
import styles from './SearchBar.module.scss';
import { useThrottle } from '../../utils/useThrottle';
import { GoabInput } from '@abgov/react-components';

export const SearchBar: React.FC<{
    placeholder: string;
    searchPattern: string;
    setSearchPattern: React.Dispatch<React.SetStateAction<string>>;
    delayMilliseconds: number;
}> = ({ placeholder, searchPattern, setSearchPattern, delayMilliseconds }) => {
    const [keyword, setKeyword] = useState<string>('');
    const throttledPattern = useThrottle(keyword, delayMilliseconds);
    useEffect(() => {
        setSearchPattern(throttledPattern);
    }, [throttledPattern]);

    return (
        <div className={styles['search-filter-container']}>
            <div className={styles['search-box-container']}>
                <GoabInput
                    type="search"
                    leadingIcon="search"
                    width="100%"
                    name="searchBox"
                    placeholder={placeholder}
                    value={searchPattern}
                    onChange={({ value }) => setKeyword(value)}
                ></GoabInput>
            </div>
        </div>
    );
};
