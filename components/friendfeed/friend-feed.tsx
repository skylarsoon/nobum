import FriendCard from "./friend-card";

const FRIENDS = [
    { username: "@yxetn", goalName: "NCLEX", score: 6.5, note: "went camping so I had a little bit less time than usual" },
    { username: "@plop", goalName: "LeetCode", score: 3.5, note: "struggling to balance work n leet" },
];

export default function FriendFeed(){
    return(
        <div className="flex flex-col gap-4">
            {
                FRIENDS.map((friend) => (
                    <FriendCard key={friend.username}{...friend}/>
                    ))
            }
        </div>
    )
}