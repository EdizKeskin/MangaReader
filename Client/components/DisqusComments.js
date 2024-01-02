import { DiscussionEmbed } from "disqus-react";
import { useLocale } from "next-intl";
const DisqusComments = ({ post, url, title }) => {
  const disqusShortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME;
  const locale = useLocale();
  const disqusConfig = {
    url: url,
    identifier: post._id,
    title: title,
    colorScheme: "dark",
    language: locale,
  };
  return (
    <div className="text-black">
      <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
    </div>
  );
};
export default DisqusComments;
