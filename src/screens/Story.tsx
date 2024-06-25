import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, Animated, TouchableWithoutFeedback, RefreshControl } from 'react-native';
import { Story } from '../utils/types';
import { getMyFriendsId } from '../utils/util';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import StoryComponent from '../components/StoryComponent';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../utils/colors';

const { width, height } = Dimensions.get('screen');

const StoryScreen = () => {
    const uid = useSelector((state: RootState) => state.auth.uid);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [visible, setVisible] = useState(false);
    const [selectedStories, setSelectedStories] = useState<Story[] | null>(null);
    const [friendIds, setFriendIds] = useState<string[] | null>([]);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const animationPausedAt = useRef(0);
    //const timePausedAt = useRef(0);
    const [refreshPage, setRefreshPage] = useState(new Date())
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (uid) {
            getMyFriendsId(uid).then((fr) => {
                setFriendIds(fr);
            }).catch(() => {
                console.log("arkadaslar alinamadi");
            });
        }
    }, [uid, refreshPage]);

    useEffect(() => {
        setCurrentStoryIndex(0);
        if (visible) {
            startStoryInterval();
        }
        return () => clearStoryInterval();
    }, [visible, selectedStories, refreshPage]);

    useEffect(() => {
        if (visible) {
            startAnimation();
        }
    }, [visible, currentStoryIndex]);

    const startStoryInterval = () => {
        intervalRef.current = setInterval(() => {
            setCurrentStoryIndex((prevIndex) => {
                const nextIndex = selectedStories && (prevIndex + 1) % selectedStories.length;
                startAnimation();
                return nextIndex!;
            });
        }, 4000) //- timePausedAt.current * 4000);
        // timePausedAt.current = 0;
    };

    const clearStoryInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startAnimation = (fromValue = 0) => {
        progressAnim.setValue(fromValue);
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: (1 - fromValue) * 4000,
            useNativeDriver: false,
        }).start(() => {
            animationPausedAt.current = 0;
        });
    };

    const stopAnimation = () => {
        progressAnim.stopAnimation((value) => {
            animationPausedAt.current = value;
            //timePausedAt.current = value;
        });
        clearStoryInterval();
    };

    const resumeAnimation = () => {
        startAnimation(animationPausedAt.current);
        startStoryInterval();
    };

    const handleRefresh = () => {
        setRefreshPage(new Date())
        setRefreshing(false)
    }


    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
            <View style={{ width: '100%', marginTop: '10%' }}>
                <Text style={{ fontSize: 24, paddingLeft: 20, fontWeight: 'bold' }}>My Story</Text>
                <StoryComponent key={uid} userId={uid!} setVisible={setVisible} setSelectedStories={setSelectedStories} />
            </View>

            <View style={{ width: '100%', marginTop: '10%' }}>
                <Text style={{ fontSize: 24, paddingLeft: 20, marginBottom: '5%', fontWeight: 'bold' }}>Other Stories</Text>
                {friendIds?.map((id, index) => (
                    <StoryComponent key={index} userId={id} setVisible={setVisible} setSelectedStories={setSelectedStories}  />
                ))}
            </View>

            <Modal visible={visible} animationType="fade" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <View style={styles.progressContainer}>
                            {selectedStories && selectedStories.map((_, index) => (
                                <View key={index} style={styles.progressBarBackground}>
                                    {index === currentStoryIndex && (
                                        <Animated.View style={[
                                            styles.progressBarForeground,
                                            {
                                                width: progressAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%'],
                                                }),
                                            }
                                        ]} />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                    <TouchableWithoutFeedback onPressIn={stopAnimation} onPressOut={resumeAnimation}>
                        <View style={styles.storyContainer}>
                            {selectedStories && (
                                <>
                                    <TouchableOpacity onPress={() => setVisible(false)} style={{ position: 'absolute', right: '12%', top: '3%', backgroundColor: colors.PRIMARY_COLOR, borderRadius: 15, padding: 5, zIndex: 1 }}>
                                        <MaterialIcons name="close" size={24} color="white" />
                                    </TouchableOpacity>
                                    <Image
                                        key={selectedStories[currentStoryIndex].storyId}
                                        source={{ uri: selectedStories[currentStoryIndex].uri }}
                                        resizeMode='stretch'
                                        style={styles.storyImage}
                                    />
                                </>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: 40,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    progressContainer: {
        zIndex: 1,
        flexDirection: 'row',
        flex: 1,
        marginHorizontal: 10,
    },
    progressBarBackground: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 2,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarForeground: {
        height: 4,
        backgroundColor: colors.PRIMARY_COLOR,
        borderRadius: 2,
    },
    storyContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyImage: {
        width: width * 0.8,
        height: height * 0.8,
        borderRadius: 20,
    },
});

export default StoryScreen;
